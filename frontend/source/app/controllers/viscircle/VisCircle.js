define(['../module'], function (controllers) {
    'use strict';

    var VisCircle = function($scope, $rootScope, $routeParams, $location, VisualizationFactory, TweetFactory){
        $scope.form = {};

        //Parametro padrão de agregação para média dos tweets (30 minutos)
        $scope.form.aggregation = 1;
        $scope.visualization = {};
        $scope.modalOpen = false;

        /*
        * Lista com os pontos a serem renderizados nos gráficos
        */
        $scope.circles = [];

        var focus, context, area, area2, xAxis, xAxis2, x, x2, y, y2, yAxis, brush, circle, scaleCircleColor, scaleCircleSize, dataNest, modal, gnodes, tooltip;
        

        var axis = {
            y : { 
                width : 40
            }
        };

        var visLine = {
            width : canvas.width - (2 * canvas.margin.x) - axis.y.width,
            height : (canvas.height * 0.6) - canvas.margin.y - canvas.ctrlTime.height,
            coord : {
                x : canvas.margin.x + axis.y.width,
                y : canvas.padding
            },
            transition : {
                duration : 100,
                ease : 'linear',
                delay : 10
            },
            gradient : {
                opacity : 0.5
            },
            circles : {
                rmin : 3,
                rmax : 30,
                padding: 2,
                height: 100
            },
            forceLayout : {
                width: canvas.width * 0.9,
                height: canvas.height * 0.9
            }
        };
        
        axis.x = {
            width : visLine.width,
            height : visLine.height,
            coord : {
                x : visLine.coord.x,
                y : visLine.coord.y + visLine.height
            }
        };
        
        axis.ctrl = JSON.parse(JSON.stringify(axis.x));
        axis.ctrl.coord.y += canvas.ctrlTime.height;
        
        axis.y = {
            width : visLine.width,
            height : visLine.height,
            coord : {
                x : visLine.coord.x,
                y : visLine.coord.y
            }
        };

        //Limpa todos os elementos SVG
        d3.selectAll("svg").remove();

        var svg = d3.select("body").append("svg")
        .attr("width", canvas.width)
        .attr("height", canvas.height)
        .style("background", "#fff")
        .append("g");

        var customTimeFormat = d3.time.format.multi([
            //["%M", function(d) { return d.getMilliseconds(); }],
            //["%H:%M:%S", function(d) { return d.getSeconds() }],
            //["%H:%M", function(d) { return d.getMinutes(); }],
            ["%H:%M", function(d) { return d.getHours(); }],
            ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
            ["%b %d", function(d) { return d.getDate() != 1; }],
            ["%B", function(d) { return d.getMonth(); }],
            ["%Y", function() { return true; }]
        ]);

        function init() {
            VisualizationFactory.getFullVisCircle({id: $routeParams.id}, successHandlerFullVisCircle);
        }
        init();

        /*
        * Função callback responsável por tratar a resposta da requisição de inicialização da visualização completa
        */
        function successHandlerFullVisCircle(data) {
            $scope.visualization = data.visualization;
            $scope.circles = data.circles;
            $scope.circles.forEach(function(d) {
                d.creat_at = new Date(d['creat_at']);
            });

            $scope.visualization.sentiments = $scope.visualization.sentiments.sort( function(a,b){ return d3.descending(a.sentiment, b.sentiment);  });

            initVisCircle();
        }

        /*
        * Função callback responsável por tratar a resposta da requisição de novos dados para a visualização (lines)
        */
        $scope.changeAggregation = function() {
            switch($scope.form.aggregation) {
                case 1:
                case 2:
                    break;

                default:
                    swalInfo('O parâmetro de agregação é inválido.');
            }
        }

        /*
        * Função callback responsável por tratar a resposta da requisição de novos dados para a visualização
        */
        function successHandlerChangeAggregation(data) {
            $scope.lines = data;
            $scope.lines.forEach(function(d) {
                d.creat_at = new Date(d['creat_at']);
            });
            $scope.renderUpdate();
        }

        /*
        * Função responsável por renderizar o gráfico principal a cada atualização de dados
        */
        $scope.renderUpdate = function() {
           focus.selectAll("circle").remove();
           svg.select(".x.axis").remove();
           context.select(".area").remove();
           context.select(".x.axis").remove();
           context.select(".x.brush").remove();

            renderFocus();
            renderContext();
            brushedend();
        }

        /*
        * Função responsável por inicializar os elementos necessários para renderização da visualização
        */
       function initVisCircle() {
            /*
            * Define o tooltip a ser utlizado na visualização do conteúdo do Tweet
            */
            tooltip = d3.tip()
            .attr("class", "d3-tip")
            .attr("color", "red")
            .offset([-10, 0])
            .html(function(d) {
                return "<span>" + d.tweet + "</span>";
            });
            svg.call(tooltip);

            /*
            * Define as escalas de tempos para utilização no eixo X do gráfico principal e no brush
            */
            x = d3.time.scale().range([(0+visLine.circles.rmax), (visLine.width-visLine.circles.rmax)]),
            x2 = d3.time.scale().range([0, visLine.width]);

            /*
            * Define as escalas lineares para utilização no eixo Y do gráfico principal e no brush
            */
            y = d3.scale.linear().range([visLine.height, 0]),
            y2 = d3.scale.linear().range([canvas.ctrlTime.height, 0]);

            /*
            * Define os dominios para a escala y e y2 de acordo como intervalo de retweets
            */
            y.domain(d3.extent($scope.circles, function(d){ return d.retweets; }));
            y2.domain(y.domain());

            /*
            * Define as axis X do gráfico principal e no brush
            * Nestas axis serão exibidas a data/hora do tweet
            */
            xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(customTimeFormat),
            xAxis2 = d3.svg.axis().scale(x2).orient("bottom").tickFormat(customTimeFormat);

            /*
            * Define a axis Y do gráfico principal
            * Nesta axis será exibido a escala de sentimento, por exemplo, [Positivo, Neutro, Negativo]
            */
            yAxis = d3.svg.axis().scale(y).orient("left");

            /*
            * Define o controle da Timeline
            */
            brush = d3.svg.brush()
            .x(x2)
            .on("brushend", brushedend);

            /*
            * Define a escala da palheta de cores a ser utilizada na coloração dos circulso (Tweets)
            */
            scaleCircleColor = d3.scale.linear()
            .domain(d3.extent($scope.visualization.sentiments, function(d){ return d.sentiment; }))
            .rangeRound(["#E74242", "#A0D100"])
            .interpolate(d3.interpolateHsl)
            ; 

            scaleCircleSize = d3.scale.linear()
            .domain(d3.extent($scope.circles, function(d){ return d.total; }))
            .rangeRound([visLine.circles.rmin, visLine.circles.rmax])
            ;

            /*
            * Define a linha para interpolação do gráfico de controle da Timeline
            */
            area2 = d3.svg.line()
            .interpolate("basic")
            .defined(function(d) { return d.retweets !== null; })
            .x(function(d) { return x2(d.creat_at); })
            .y(function(d) { return y2(d.retweets); });

            /*
            * Renderiza o gráfico principal
            */
            svg.append("svg:rect")
            .attr("width", visLine.width)
            .attr("height", visLine.height)
            .attr("class", "rect")
            .style("fill", "#FFF")
            .attr("transform", "translate(" + visLine.coord.x + "," + visLine.coord.y + ")");

            /*
            * Cria o limite de renderização dos pontos do gráfico principal
            */
            svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", visLine.width)
            .attr("height", (visLine.height + 20));

            renderFocus();
            renderFocusSentimentScale();
            renderContext();
        }

        /*
        * Função responsável por renderizar o gráfico de principal
        */
        function renderFocus() {
            /*
            * Renderiza os elementos referentes ao gráfico principal
            */
            focus = svg.append("g")
            .attr("class", "focus")
            .attr("clip-path", "url(#clip)")
            .attr("transform", "translate(" + visLine.coord.x + "," + visLine.coord.y + ")");

            /*
            * Define os dominios para as escalas x, x2 de acordo com as datas dos tweets
            */
            x.domain(d3.extent($scope.circles, function(d) { return d.creat_at; }));
            x2.domain(x.domain());

            /*
            * Agrupa os tweets por data
            */
            dataNest = d3.nest()
                .key(function(d) {return d.creat_at.getTime();})
                .key(function(d) {return d.sentiment;})
                .rollup(function(d) { 
                    return d3.sum(d, function(g) {return g.total; });
                })
                .entries($scope.circles)
                .map(function(d){
                    var key = d.key
                    var children = d.values.map(function(dd){
                        var key = +dd.key

                        return {'key':key, 'value': dd.values}
                    })
                    return {'key':key, 'value': (visLine.circles.rmax*2), 'children':children.sort(function(a,b){ return d3.descending(a.value, b.value); })}
                })
                ;

            /*
            * Renderiza os circulos do gráfico principal
            */
            if($scope.form.aggregation == 1){
                circle = focus.selectAll(".gcircle")
                .data(dataNest);

                circle.enter().append("g")
                .attr("class", "gcircle")
                .attr("transform", function(d, i) { return "translate(" + x(new Date().setTime(d.key)) + "," + (visLine.circles.height) + ")"; });

                circle.selectAll(".gcircle")
                .data(function(d){
                    var ra = 0;
                    d.children.map(function(e, i){
                        e.parent = d.key/1000;
                        e.ra = ra;
                        if( i == 0 )
                            ra += scaleCircleSize(e.value) + 2;
                        else {
                            ra += (scaleCircleSize(e.value) * 2 ) + 2;
                        }
                    });
                    return d;
                });

                var xcircle = circle.selectAll(".gcircle")
                    .data(function(d){ return d.children; })
                    .enter().append("circle")
                    .attr("fill", function(d) { return scaleCircleColor(d.key); })
                    .attr("r", function(d) { return scaleCircleSize(d.value); })
                    .attr("transform", function(d, i) { return "translate(" + 0 + "," + (i == 0 ? 0 : (scaleCircleSize(d.value) + d.ra)) + ")"; })
                    .on("click", function(d) {
                        TweetFactory.getVisCircleTweets({id:$routeParams.id, timestamp: d.parent}, successHandlerTweetsByHour);
                    })
                    ;

                circle.exit().remove();
            } else {

            }

            /*
            * Rendereiza a axis X (time) do gráfico principal
            */
            svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate("+ visLine.coord.x +"," + (visLine.coord.y + visLine.height) + ")")
            .call(xAxis);
        }

        function successHandlerTweetsByHour(tweets) {
            $scope.modalOpen = true;

            var scaleCircleTweetSize = d3.scale.linear()
            .domain(d3.extent(tweets, function(d){ return d.retweets; }))
            .rangeRound([visLine.circles.rmin, visLine.circles.rmax])
            ;

            var force = d3.layout.force()
                        .nodes(tweets)
                        .friction(0.3)
                        .gravity(0.05)
                        .charge(-15)
                        .size([visLine.forceLayout.width, visLine.forceLayout.height])
                        ;
            force.start();
            
            modal = svg.append("svg:rect")
                    .attr("width", canvas.width)
                    .attr("height", canvas.height)
                    .style("fill", "#fff")
                    .style("opacity", .98);

            gnodes = svg.append("g")
                .attr("class", "gtcircle")
                .attr("fill", "#fff")
                .attr("transform", "translate("+ ((canvas.width-visLine.forceLayout.width)/2) +", 30)")
                ;

/*            var nodes = gnodes.selectAll(".tcircle")
                    .data(tweets)
                    .enter()
                    .append("circle")
                    .attr("class", "tcircle")
                    .attr("r", function(d) { return scaleCircleTweetSize(d.retweets); })
                    .style("fill", function(d,i) { return scaleCircleColor(d.sentiment); })
                    .call(force.drag)
                    ;
 */               

            setTimeout(function() {
              force.start();
              var n = tweets.length;
              for (var i = n * n; i > 0; --i) force.tick();
              force.stop();

              var nodes = gnodes.selectAll(".tcircle")
                .data(tweets)
                .enter().append("circle")
                .attr("class", "tcircle")
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .attr("r", function(d) { return scaleCircleTweetSize(d.retweets); })
                .style("fill", function(d,i) { return scaleCircleColor(d.sentiment); })
                .call(force.drag)
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide)
                ;

                force.on("tick", function() {
                    nodes
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; })
                });
            }, 10);

        }

        /*
        * Função responsável por renderizar a escalade sentimento textual (Axis Y)
        */
        function renderFocusSentimentScale() {
            /*
            * Define uma escala ordinal de sentimentos para ser utilizada no gráfico principal
            */           
            var labelScale = d3.scale.linear()
            .domain(y.domain().reverse())
            .range([0, visLine.height])
            ;
            
            /*
            * Define a axis (Y) com a representação textual da escala de sentimentos
            */              
            var sentimentAxis = d3.svg.axis()
            .scale(labelScale)
            .orient("left");

            /*
            * Renderiza a axis de sentimento textual (Y)
            */   
            svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate("+ visLine.coord.x +"," + visLine.coord.y + ")")
            .call(sentimentAxis);
        }

        /*
        * Função responsável por renderizar o gráfico de controle
        */
        function renderContext() {
            /*
            * Renderiza os elementos referentes ao gráfico de controle da Timeline
            */
            context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + axis.ctrl.coord.x + "," + axis.ctrl.coord.y + ")");

            /*
            * Renderiza a linha do gráfico de controle
            */
            context.append("path")
            .datum($scope.circles)
            .attr("class", "area")
            .attr("d", area2);

            /*
            * Rendereiza a axis X (time) do gráfico de controle
            */
            context.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + canvas.ctrlTime.height + ")")
            .call(xAxis2);

            /*
            * Inicializa o gráfico principal e o brush de controle da Timeline com o intervalo de datas completo
            */
            //brush.extent(x2.domain());

            /*
            * Renderiza o brush do gráfico principal
            */
            context.append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", -canvas.padding)
            .attr("height", canvas.ctrlTime.height + canvas.padding - 1)
            ;
        }

        /*
        * Função callback executada enquanto o brush é manipulado (movimentado)
        * Esta função é responsável por alterar o estado da visualização do gráfico principal
        */
        function brushing() {

        }

        /*
        * Função callback executada quando finalizada a manipulação do brush
        * Para efeitos de performance, o gráfico somente é renderizado após concluida a interação do usuário com o controle da timeline
        */
        function brushedend(){
            x.domain(brush.empty() ? x2.domain() : brush.extent());
            
            focus.selectAll(".gcircle")
            .transition().duration(visLine.transition.duration).ease(visLine.transition.ease)
            //.attr("cx", function(d) { return x(new Date().setTime(d.key)); })
            .attr("transform", function(d) { return "translate(" + x(new Date().setTime(d.key)) + "," + 100 + ")"; });

            svg.select(".x.axis")
            .transition().duration(visLine.transition.duration).ease(visLine.transition.ease)
            .call(xAxis);
        }

        /*
        * Função responsável por resetar a seleção do gráfico de controle e atualizar o gráfico principal
        */
        $scope.clearBrushSelection = function() {
            d3.selectAll("g.brush").call(brush.clear());
            brushedend();
        }

        $scope.closeModal = function() {
            modal.remove();
            gnodes.remove();
            $scope.modalOpen = false;
        }

    }

    controllers.controller('VisCircle', ['$scope', '$rootScope', '$routeParams', '$location', 'VisualizationFactory', 'TweetFactory', VisCircle]);
});