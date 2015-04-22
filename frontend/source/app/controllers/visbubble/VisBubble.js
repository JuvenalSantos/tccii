define(['../module'], function (controllers) {
    'use strict';

    var VisBubble = function($scope, $rootScope, $routeParams, $location, VisualizationFactory, TweetFactory){
        $scope.form = {};

        //Parametro padrão de agregação para média dos tweets (30 minutos)
        $scope.form.aggregation = "30m";
        $scope.visualization = {};

        /*
        * Lista com os pontos a serem renderizados nos gráficos
        */
        $scope.bubbles = [];

        var focus, context, area, area2, xAxis, xAxis2, x, x2, y, y2, yAxis, brush, circle, scaleCircleColor;
        

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
                duration : 200,
                ease : 'linear'
            },
            gradient : {
                opacity : 0.5
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
            ["%H:%M:%S", function(d) { return d.getSeconds() }],
            ["%H:%M", function(d) { return d.getMinutes(); }],
            ["%H:%M", function(d) { return d.getHours(); }],
            ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
            ["%b %d", function(d) { return d.getDate() != 1; }],
            ["%B", function(d) { return d.getMonth(); }],
            ["%Y", function() { return true; }]
        ]);         
       
        var scaleSentimen

        function init() {
            VisualizationFactory.getFullVisBubble({id: $routeParams.id, retweets: 50}, successHandlerFullVisBubble);
        }
        init();

        /*
        * Função callback responsável por tratar a resposta da requisição de inicialização da visualização completa
        */
        function successHandlerFullVisBubble(data) {
            $scope.visualization = data.visualization;
            $scope.bubbles = data.bubbles;
            $scope.bubbles.forEach(function(d) {
                d.creat_at = new Date(d['creat_at']);
            });

            $scope.visualization.sentiments = $scope.visualization.sentiments.sort( function(a,b){ return d3.descending(a.sentiment, b.sentiment);  });

            initVisBubble();
        }

        /*
        * Função callback responsável por tratar a resposta da requisição de novos dados para a visualização (lines)
        */
        $scope.changeAggregation = function() {
            switch($scope.form.aggregation) {
                case '5m':
                    TweetFactory.getVisSingleLine({id:$routeParams.id, aggregation: $scope.form.aggregation}, successHandlerChangeAggregation);
                    break;

                case '10m':
                    TweetFactory.getVisSingleLine({id:$routeParams.id, aggregation: $scope.form.aggregation}, successHandlerChangeAggregation);
                    break;

                case '15m':
                    TweetFactory.getVisSingleLine({id:$routeParams.id, aggregation: $scope.form.aggregation}, successHandlerChangeAggregation);
                    break;

                case '30m':
                    TweetFactory.getVisSingleLine({id:$routeParams.id, aggregation: $scope.form.aggregation}, successHandlerChangeAggregation);
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
       function initVisBubble() {
            /*
            * Define as escalas de tempos para utilização no eixo X do gráfico principal e no brush
            */
            x = d3.time.scale().range([0, visLine.width]),
            x2 = d3.time.scale().range([0, visLine.width]);

            /*
            * Define as escalas lineares para utilização no eixo Y do gráfico principal e no brush
            */
            y = d3.scale.linear().range([visLine.height, 0]),
            y2 = d3.scale.linear().range([canvas.ctrlTime.height, 0]);

            /*
            * Define os dominios para a escala y e y2 de acordo como intervalo de retweets
            */
            y.domain(d3.extent($scope.bubbles, function(d){ return d.retweets; }));
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
            .rangeRound(["#D12500", "#A0D100"])
            .interpolate(d3.interpolateHsl)
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
            x.domain(d3.extent($scope.bubbles, function(d) { return d.creat_at; }));
            x2.domain(x.domain());

            /*
            * Renderiza a linha do gráfico principal
            */
            circle = focus.selectAll("circle")
            .data($scope.bubbles)

            circle.exit().remove();

            circle.enter().append("circle")
                .attr("fill", function(d) { return scaleCircleColor(d.sentiment); })
                .attr("r", 4);

            circle
                .attr("cx", function(d) { return x(d.creat_at); })
                .attr("cy", function(d) { return y(d.retweets); });

            /*
            * Rendereiza a axis X (time) do gráfico principal
            */
            svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate("+ visLine.coord.x +"," + (visLine.coord.y + visLine.height) + ")")
            .call(xAxis);
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
            .datum($scope.bubbles)
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
            
            svg.select(".x.axis").call(xAxis);
            
            focus.selectAll("circle")
            //.data($scope.lines)
            .attr("cx", function(d) { return x(d.creat_at); })
        }

        /*
        * Função responsável por resetar a seleção do gráfico de controle e atualizar o gráfico principal
        */
        $scope.clearBrushSelection = function() {
            d3.selectAll("g.brush").call(brush.clear());
            brushedend();
        }

    }

    controllers.controller('VisBubble', ['$scope', '$rootScope', '$routeParams', '$location', 'VisualizationFactory', 'TweetFactory', VisBubble]);
});