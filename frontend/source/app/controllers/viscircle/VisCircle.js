define(['../module'], function (controllers) {
    'use strict';

    var VisCircle = function($scope, $rootScope, $routeParams, $location, VisualizationFactory, TweetFactory){
        $scope.form = {};

        //Parametro padrão de agregação para média dos tweets (30 minutos)
        $scope.form.aggregation = 1;
        $scope.visualization = {};
        $scope.subjects = [];
        $scope.modalOpen = false;

        /*
        * Lista com os pontos a serem renderizados nos gráficos
        */
        $scope.circles = [];

        var focus, context, area, area2, xAxis, xAxis2, x, x2, y, y2, yAxis, brush, circle, scaleCircleColor, scaleCircleSize, dataNest, modal, gnodes, tooltip, tooltipCircle, foci, tcircles, tweetsByHour, scaleCircleTweetSize, gLegendTweets, gLegendPrincipal;
        

        var axis = {
            y : { 
                width : 40
            }
        };

        var visLine = {
            width : canvas.width - (2 * canvas.margin.x) - axis.y.width,
            height : canvas.height - canvas.margin.y - canvas.ctrlTime.height - 70 - 100,
            coord : {
                x : canvas.margin.x + axis.y.width,
                y : canvas.padding + 100
            },
            transition : {
                duration : 100,
                ease : 'linear',
                delay : 10
            },
            legend : {
                width : 150,
                fontSize: "12px"
            },
            gradient : {
                opacity : 0.5
            },
            circles : {
                rmin : 3,
                rmax : 30,
                padding: 2,
                height: 100,
                transition : {
                    duration: 1000,
                    ease : 'linear'
                },
            },
            forceLayout : {
                width: canvas.width * 0.9,
                height: canvas.height * 0.8
            },
            subject : {
                height: 200,
                transition : {
                    duration: 750,
                    ease : 'linear'
                }
            }
        };
        
        visLine.circles.coord = {
                x : visLine.coord.x,
                y : visLine.coord.y + visLine.circles.rmax
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

        var svg; /*= d3.select("body").append("svg")
        .attr("width", canvas.width)
        .attr("height", canvas.height)
        .style("background", "#fff")
        .append("g");*/

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
            $scope.followersMinMax = data.followers_min_max;
            $scope.circles.forEach(function(d) {
                d.creat_at = new Date(d['creat_at']);
            });
            $scope.sub = data.subjects;

            $scope.sub.forEach(function(d, i){
                d.y = (i == 0) ? 0 : i * visLine.subject.height;
                $scope.subjects[d.subject] = d;
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
                    $scope.renderUpdate();
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
           svg.selectAll("text.subject").remove();
           focus.remove();
           context.remove();

            renderFocus();
            renderContext();
            brushedend();
        }

        function initFoci(){
            foci = [];
            var x = 0;
            var portion = visLine.forceLayout.width/(2 + ($scope.visualization.sentiments.length-1))
            $scope.visualization.sentiments.forEach(function(e){
                x += portion;
                foci[e.sentiment] = {x: x, y: visLine.forceLayout.height/2};  
                
            });           
        }

        /*
        * Função responsável por inicializar os elementos necessários para renderização da visualização
        */
       function initVisCircle() {
            svg = d3.select("body").append("svg")
                .attr("width", canvas.width)
                .attr("height", function (){
                    var h = $scope.subjects.lenght * visLine.subject.height;
                    if( h > canvas.height)
                        return h;
                    else
                        return canvas.height;
                })
                .style("background", "#fff")
                .append("g");

            initFoci();

            /*
            * Define o tooltip a ser utlizado na visualização do conteúdo do Tweet
            */
            tooltip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-10, 0])
            .html(function(d) {
                return "<span>Followers: <strong>" + d.retweets + "</strong>. Tweet: " + d.tweet + "</span>";
            });
            svg.call(tooltip);

            /*
            * Define o tooltip a ser utlizado na visualização da quantidades de Tweet do circulo
            */
            tooltipCircle = d3.tip()
            .attr("class", "d3-tip")
            .offset([-10, 0])
            .html(function(d) {
                var t = d.value == undefined ? d.values : d.value;
                return "<span>Tweets: <strong>" + t + "</strong></span>";
            });
            svg.call(tooltipCircle);

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
            * Define a escala da palheta de cores a ser utilizada na coloração dos circulos (Tweets)
            */
            scaleCircleColor = d3.scale.linear()
            .domain(d3.extent($scope.visualization.sentiments, function(d){ return d.sentiment; }))
            .rangeRound(["#E74242", "#A0D100"])
            .interpolate(d3.interpolateHsl)
            ; 

            /*
            * Define a escala de tamanho (raio) dos circulso da visualização
            */
            scaleCircleSize = d3.scale.linear()
            .domain([1, d3.max($scope.circles, function(d){ return d.total; })])
            .range([visLine.circles.rmin, visLine.circles.rmax])
            ;

            /*
            * Define a escala de tamanho (raio) dos circulos da visualização de Tweets por hora
            */
            scaleCircleTweetSize = d3.scale.linear()
            .domain([$scope.followersMinMax.min, $scope.followersMinMax.max])
            .range([visLine.circles.rmin, visLine.circles.rmax])
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
            renderLegendPrincipal();
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
            * Renderiza os circulos do gráfico principal
            */
            if($scope.form.aggregation == 1){
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
                        return {'key':key, 'children':children.sort(function(a,b){ return d3.descending(a.value, b.value); })}
                    })
                    ;

                scaleCircleSize.domain([1, d3.max(dataNest, function(d){ return d3.max(d.children, function(e){return e.value;});})]);

                circle = focus.selectAll(".gcircle")
                .data(dataNest);

                circle.enter().append("g")
                .attr("class", "gcircle")
                .attr("transform", function(d, i) { return "translate(" + x(new Date().setTime(d.key)) + "," + (visLine.circles.rmax + visLine.circles.padding) + ")"; });

                circle.selectAll(".gcircle")
                .data(function(d){
                    var ra = 0;
                    d.children.map(function(e, i){
                        e.parent = d.key/1000;
                        e.ra = ra;
                        if( i == 0 )
                            ra += scaleCircleSize(e.value) + visLine.circles.padding;
                        else {
                            ra += (scaleCircleSize(e.value) * 2 ) + visLine.circles.padding;
                        }
                    });
                    return d;
                });

                var xcircle = circle.selectAll(".gcircle")
                    .data(function(d){ return d.children; })
                    .enter().append("circle")
                    .attr("fill", function(d) { return scaleCircleColor(d.key); })
                    .attr("r", function(d) { return 0; })
                    .on("click", function(d) {
                        TweetFactory.getVisCircleTweets({id:$routeParams.id, timestamp: d.parent}, successHandlerTweetsByHour);
                    })
                    .on('mouseover', tooltipCircle.show)
                    .on('mouseout', tooltipCircle.hide)
                    ;

                    xcircle.transition()
                        .duration(visLine.circles.transition.duration).ease(visLine.circles.transition.ease)
                        .attr("r", function (d) { return scaleCircleSize(d.value); })
                        .attr("transform", function(d, i) { return "translate(0," + (i == 0 ? 0 : (scaleCircleSize(d.value) + d.ra)) + ")"; })
                        ;

                circle.exit().remove();

                var subjectAxisY = svg.append("text")
                        .attr("class", "subject")
                        .attr("x", 5)
                        .attr("y", visLine.circles.coord.y)
                        .text("Geral")
                        .style("text-anchor", "start");

                subjectAxisY.transition()
                    .duration(visLine.subject.transition.duration).ease(visLine.subject.transition.ease)
                    .attr("y", function(d) { return visLine.circles.coord.y; })
            } else {
                /*
                * Agrupa os tweets por data e assunto
                */
                dataNest = d3.nest()
                    .key(function(d) {return d.creat_at.getTime();})
                    .key(function(d){ return d.subject; })
                    .key(function(d) {return d.sentiment;})
                    .rollup(function(d) { 
                        return d3.sum(d, function(g) {return g.total; });
                    })
                    .entries($scope.circles)
                    .map(function(d){
                        d.values.map(function(dd){
                            dd.values.sort(function(a,b){ return d3.descending(a.values, b.values); })
                        });
                        return d;
                    })
                    ;

                circle = focus.selectAll(".gcircle")
                .data(dataNest);

                circle.enter().append("g")
                .attr("class", "gcircle")
                .attr("transform", function(d, i) { return "translate(" + x(new Date().setTime(d.key)) + "," + (visLine.circles.rmax + visLine.circles.padding) + ")"; });

                circle.selectAll(".gcircle")
                .data(function(d){
                    d.values.map(function(e, i){
                        var ra = 0;
                        e.values.map(function(f, j){
                            f.parent = d.key/1000;
                            f.subject = e.key;
                            f.ra = ra;
                            if( j == 0 )
                                ra += scaleCircleSize(f.values) + visLine.circles.padding;
                            else {
                                ra += (scaleCircleSize(f.values) * 2 ) + visLine.circles.padding;
                            }
                        });
                    });
                    return d;
                });

                var subcircle = circle.selectAll(".gcircle")
                    .data(function(d){ return d.values; })
                    .enter().append("g")
                    .attr("class", "subcircle")
                    ;

                subcircle.transition()
                    .duration(visLine.subject.transition.duration).ease(visLine.subject.transition.ease)
                    .attr("transform", function(d) { return "translate(0," + ($scope.subjects[d.key].y + visLine.circles.padding) + ")"; })
                    ;

                var xcircle = subcircle.selectAll(".subcircle")
                    .data(function(d){ return d.values; })
                    .enter().append("circle")
                    .attr("fill", function(d) { return scaleCircleColor(d.key); })
                    .attr("r", 0)
                    .on("click", function(d) {
                        TweetFactory.getVisCircleTweetsBySubject({id:$routeParams.id, timestamp: d.parent, subject: d.subject}, successHandlerTweetsByHour);
                    })
                    .on('mouseover', tooltipCircle.show)
                    .on('mouseout', tooltipCircle.hide)
                    ;

                xcircle.transition()
                    .duration(visLine.circles.transition.duration).ease(visLine.circles.transition.ease)
                    .attr("r", function (d) { return scaleCircleSize(d.values); })
                    .attr("transform", function(d, i) { return "translate(" + 0 + "," + (i == 0 ? 0 : (scaleCircleSize(d.values) + d.ra)) + ")"; })
                    ;

                circle.exit().remove();

                var subjectAxisY = svg.selectAll("text.subject")
                    .data(d3.values($scope.subjects))
                    .enter()
                        .append("text")
                        .attr("class", "subject")
                        .attr("x", 5)
                        .attr("y", visLine.circles.coord.y)
                        .text(function(d){ return d.subject; })
                        .style("text-anchor", "start");

                subjectAxisY.transition()
                    .duration(visLine.subject.transition.duration).ease(visLine.subject.transition.ease)
                    .attr("y", function(d) { return visLine.circles.coord.y + d.y; })

            }

            /*
            * Rendereiza a axis X (time) do gráfico principal
            */
            svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate("+ visLine.coord.x +"," + (visLine.coord.y + visLine.height) + ")")
            .call(xAxis);
        }

        function forceCharge(d){
            var size = scaleCircleTweetSize(d.retweets);
            size = size < 4 ? 4 : size;

            return -(Math.pow((size * 1.45), 2));
        }

        function forceTick(e) {
          var k = 1.2 * e.alpha;
          tweetsByHour.forEach(function(o, i) {
            o.y += (foci[o.sentiment].y - o.y) * k;
            o.x += (foci[o.sentiment].x - o.x) * k;
          });

          tcircles
              .attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });
        }

        function successHandlerTweetsByHour(tweets) {
            tweetsByHour = tweets;
            $scope.modalOpen = true;

            var force = d3.layout.force()
                        .nodes(tweets)
                        //.friction(0.9)
                        //.gravity(1)
                        .charge(forceCharge)
                        //.alpha(0)
                        .size([visLine.forceLayout.width, visLine.forceLayout.height])
                        ;

            //force.start();
            
            modal = svg.append("svg:rect")
                    .attr("width", canvas.width)
                    .attr("height", canvas.height)
                    .style("fill", "#fff")
                    .style("opacity", .99);

            gnodes = svg.append("g")
                .attr("class", "gtcircle")
                .attr("fill", "#fff")
                .attr("transform", "translate("+ ((canvas.width-visLine.forceLayout.width)/2) +", "+ (visLine.circles.rmax + 10) +")")
                ;

            tcircles = gnodes.selectAll(".tcircle")
                    .data(tweets)
                    .enter()
                    .append("circle")
                    .attr("class", "tcircle")
                    .attr("r", function(d) { return scaleCircleTweetSize(d.retweets); })
                    .attr("cx", function(d){ return d.x; })
                    .attr("cy", function(d){ return d.y; })
                    .style("fill", function(d,i) { return scaleCircleColor(d.sentiment); })
                    //.call(force.drag)
                    .on('mouseover', tooltip.show)
                    .on('mouseout', tooltip.hide)
                    ;

            force.on("tick", forceTick);

            force.start();

            renderLegendTweets();
        }

        function renderLegendTweets() {
            /*
            * Renderiza a legenda do gráfico de Tweets
            */

            var gScaleSizes = 0;
            var sizes = [
                $scope.followersMinMax.min,
                Math.floor($scope.followersMinMax.max/2),
                $scope.followersMinMax.max
            ];

            gLegendTweets = svg.append("g")
                .attr("class", "g-legend-tweets")
                .attr("transform", "translate(20, 0)");

            var gScaleTexts = gLegendTweets.append("g")
                .attr("class", "g-legend-tweets-texts");

            var scaleTexts = gScaleTexts.append("text")    
                .attr("x", 20)
                .attr("y", visLine.circles.rmax + 10)
                .style("text-anchor", "start");

            scaleTexts.append("tspan")
                .style("font-color", "#777")
                .style("fill", "#777")
                .text("Followers do autor do tweet: ");
                
            gLegendTweets.attr("transform", function(d){ gScaleSizes = this.getBBox().width + 20; return "translate(0,0)"; });

            var gScaleCircles = gLegendTweets.append("g")
                .attr("class", "g-legend-tweets-circles");

            var scaleCircles = gScaleCircles.selectAll("g")
                .data(sizes)
                .enter().append("g")
                .attr("class", "g-followers");

            scaleCircles.append("circle")
                .attr("class", "circleLegend")
                .attr("r", scaleCircleTweetSize);

            scaleCircles.append("text")
                .attr("x", function(d) { return scaleCircleTweetSize(d) + 4; })
                .attr("dy", ".35em")
                .text(function(d) { return d; });

            scaleCircles.attr("transform", function(d) {
                var y = visLine.circles.rmax + 5;
                var t = "translate(" + (gScaleSizes + 20) + ", "+ y +")";
                gScaleSizes += this.getBBox().width + y;
                return t;
            });

            var gScaleSentiments = gLegendTweets.append("text")    
                .attr("x", gScaleSizes)
                .attr("y", visLine.circles.rmax + 10)
                .style("text-anchor", "start");

            gScaleSentiments.append("tspan")
                .style("font-color", "#777")
                .style("fill", "#777")
                .text("Sentimentos: ");

            gLegendTweets.attr("transform", function(d){ gScaleSizes = this.getBBox().width + 30; return "translate(0,0)"; });

            var legendGroup = gLegendTweets.append("g")
            .attr("class", "legendgroup")
            .attr("transform", "translate("+ ( gScaleSizes + 15 ) +"," + (visLine.circles.rmax + 5) + ")")
            ;

            var legend = legendGroup.selectAll(".legend")
            .data($scope.visualization.sentiments)
            .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i){ return "translate("+ (visLine.legend.width * i)+", 0)"; })
            ;

            legend.append("circle")
                .attr("r", 7)
                .attr("fill", function(d, i) { return scaleCircleColor(d.sentiment); })
            ;

            legend.append("text")
                .text(function(d) { return d.description; })
                .style("font-size", visLine.legend.fontSize)
                .attr("dx", "15px")
                .attr("dy", ".40em")
                ;
        }

        function renderLegendPrincipal() {
            /*
            * Renderiza a legenda do gráfico principal
            */

            var gScaleSizes = 0;

            var sizes = [
                scaleCircleSize.domain()[0],
                Math.floor(scaleCircleSize.domain()[1]/2),
                scaleCircleSize.domain()[1]
            ];

            gLegendPrincipal = svg.append("g")
                .attr("class", "g-legend-principal")
                .attr("transform", "translate(20, 0)");

            var gScaleTexts = gLegendPrincipal.append("g")
                .attr("class", "g-legend-principal-texts");

            var scaleTexts = gScaleTexts.append("text")    
                .attr("x", 20)
                .attr("y", visLine.circles.rmax + 10)
                .style("text-anchor", "start");

            scaleTexts.append("tspan")
                .style("font-color", "#777")
                .style("fill", "#777")
                .text("Quantidade de Tweets: ");
                
            gLegendPrincipal.attr("transform", function(d){ gScaleSizes = this.getBBox().width + 20; return "translate(0,0)"; });

            var gScaleCircles = gLegendPrincipal.append("g")
                .attr("class", "g-legend-principal-circles");

            var scaleCircles = gScaleCircles.selectAll("g")
                .data(sizes)
                .enter().append("g")
                .attr("class", "g-tweets");

            scaleCircles.append("circle")
                .attr("class", "circleLegend")
                .attr("r", scaleCircleSize);

            scaleCircles.append("text")
                .attr("x", function(d) { return scaleCircleSize(d) + 4; })
                .attr("dy", ".35em")
                .text(function(d) { return d; });

            scaleCircles.attr("transform", function(d) {
                var y = visLine.circles.rmax + 5;
                var t = "translate(" + (gScaleSizes + 20) + ", "+ y +")";
                gScaleSizes += this.getBBox().width + y;
                return t;
            });

            var gScaleSentiments = gLegendPrincipal.append("text")    
                .attr("x", gScaleSizes)
                .attr("y", visLine.circles.rmax + 10)
                .style("text-anchor", "start");

            gScaleSentiments.append("tspan")
                .style("font-color", "#777")
                .style("fill", "#777")
                .text("Sentimentos: ");

            gLegendPrincipal.attr("transform", function(d){ gScaleSizes = this.getBBox().width + 30; return "translate(0,0)"; });

            var legendGroup = gLegendPrincipal.append("g")
            .attr("class", "legendgroup")
            .attr("transform", "translate("+ ( gScaleSizes + 15 ) +"," + (visLine.circles.rmax + 5) + ")")
            ;

            var legend = legendGroup.selectAll(".legend")
            .data($scope.visualization.sentiments)
            .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i){ return "translate("+ (visLine.legend.width * i)+", 0)"; })
            ;

            legend.append("circle")
                .attr("r", 7)
                .attr("fill", function(d, i) { return scaleCircleColor(d.sentiment); })
            ;

            legend.append("text")
                .text(function(d) { return d.description; })
                .style("font-size", visLine.legend.fontSize)
                .attr("dx", "15px")
                .attr("dy", ".40em")
                ;
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
            .attr("transform", function(d) { return "translate(" + x(new Date().setTime(d.key)) + "," + visLine.circles.rmax + ")"; });

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
            gLegendTweets.remove();
            $scope.modalOpen = false;
        }

    }

    controllers.controller('VisCircle', ['$scope', '$rootScope', '$routeParams', '$location', 'VisualizationFactory', 'TweetFactory', VisCircle]);
});