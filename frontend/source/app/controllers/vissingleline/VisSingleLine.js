define(['../module'], function (controllers) {
    'use strict';

    var VisSingleLine = function($scope, $rootScope, $routeParams, $location, VisualizationFactory, TweetFactory){
        $scope.form = {};

        //Parametro padrão de agregação para média dos tweets (30 minutos)
        $scope.form.aggregation = "30m";
        $scope.visualization = {};
        $scope.cloudTags = [];

        /*
        * Lista com os pontos a serem renderizados nos gráficos
        */
        $scope.lines = [];

        var focus, context, area, area2, xAxis, xAxis2, x, x2, y, y2, yAxis, brush, scaleFontColor, subjectLineColor, dataNest, axisLabel;
        

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
                y : (canvas.height * 0.3)
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
            cloudTag : {
                width : 0,
                height : (canvas.height * 0.3) - canvas.margin.y - canvas.ctrlTime.height - canvas.padding,
                fontSize : {
                    min : 11,
                    max : 50
                }
            }
        };
        visLine.cloudTag.width = visLine.width * 0.9;
        visLine.cloudTag.coord = {
            x : canvas.center.x,
            y : (canvas.height * 0.15)
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

        /*
        * Remove a instancia SVG caso ela exista e cria uma nova
        */
        d3.selectAll("svg").remove();
        var svg = d3.select("body").append("svg")
        .attr("width", canvas.width)
        .attr("height", canvas.height)
        .style("background", "#fff")
        .append("g");

        /*
        * Rendereiza o Loader
        */
        svg.append("text")
            .text("Aguarde, gerando visualização.")
            .style("font-size", 15)
            .style("fill", "#777")
            .style("text-anchor", "middle")
            .attr("x", canvas.width/2)
            .attr("y", visLine.height/2)
            .attr("dx", "15px")
            .attr("dy", ".40em")
            .attr("class", "loader")
            ;
       
        // Backgroud do Gráfico
        var gradient = svg.append("svg:defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

        gradient.append("svg:stop")
        .attr("offset", "0%")
        .attr("stop-color", "#368F01")
        .attr("stop-opacity", visLine.gradient.opacity);

        gradient.append("svg:stop")
        .attr("offset", "50%")
        .attr("stop-color", "#ECEC00")
        .attr("stop-opacity", visLine.gradient.opacity);

        gradient.append("svg:stop")
        .attr("offset", "100%")
        .attr("stop-color", "#FA3301")
        .attr("stop-opacity", visLine.gradient.opacity);   

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
       
        function init() {
            VisualizationFactory.getFullVisualization({id:$routeParams.id, aggregation: $scope.form.aggregation}, successHandlerFullVisualization);
        }
        init();

        /*
        * Função callback responsável por tratar a resposta da requisição de inicialização da visualização completa
        */
        function successHandlerFullVisualization(data) {
            $scope.visualization = data.visualization;
            $scope.lines = data.lines;
            $scope.lines.forEach(function(d) {
                d.creat_at = new Date(d['creat_at']);
            });
            $scope.visualization.sentiments = $scope.visualization.sentiments.sort( function(a,b){ return d3.descending(a.sentiment, b.sentiment);  });
            $scope.cloudTags = data.cloud_tags;

            initVisSingleLine();
        }

        /*
        * Função callback responsável por tratar a resposta da requisição de novos dados para a visualização (lines)
        */
        $scope.changeAggregation = function() {
            switch($scope.form.aggregation) {
                case '5m':
                case '10m':
                case '15m':
                case '30m':
                case '60m':
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
           focus.selectAll(".area-g").remove();
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
       function initVisSingleLine() {
            /*
            * Define as escalas de tempos para utilização no eixo X do gráfico principal e no brush
            */
            x = d3.time.scale().range([0, visLine.width]),
            x2 = d3.time.scale().range([0, visLine.width]);

            /*
            * Define as escalas lineares para utilização no eixo Y do gráfico principal e no brush
            */
            y = d3.scale.linear().range([visLine.height-2, 2]),
            y2 = d3.scale.linear().range([canvas.ctrlTime.height, 0]);

            /*
            * Define os dominios para a escala y e y2 de acordo como intervalo [-1,1]
            */
            y.domain(d3.extent($scope.visualization.sentiments, function(d){ return d.sentiment; }));
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
            * Define a escala utilizada para o tamanho da fonte do texto da Cloud Tag
            * O domínio da escala é definido com base no menor e o maior valor de "size" contido na Cloud Tag
            * O range da escala é definido manualmente e os valores padrão são [9, 50]
            */
            var scaleFontSize = d3.scale.linear()
            .domain(d3.extent($scope.cloudTags, function(d){ return d.size; }))
            .rangeRound([visLine.cloudTag.fontSize.min, visLine.cloudTag.fontSize.max]);

            /*
            * Define a escala da palheta de cores a ser utilizada na coloração das linhas
            */
            subjectLineColor = d3.scale.category10();

            /*
            * Define a escala da palheta de cores a ser utilizada na Cloud Tag
            * Consulte D3JS Category20 para mais detalhes
            */
            scaleFontColor = d3.scale.linear()
            .domain(scaleFontSize.domain())
            //.rangeRound(["#484848", "#616161", "#7B7B7B", "#959595", "#AFAFAF"])
            .rangeRound(["#AFAFAF", "#313131"])
            .interpolate(d3.interpolateHsl)
            ; 

            /*
            * Cria a Cloud Tag
            */
            d3.layout.cloud()
            .size([visLine.cloudTag.width, visLine.cloudTag.height])
            .fontSize(function(d) { return scaleFontSize(d.size); })
            .rotate(0)
            .padding(1)
            .on("end", drawTags)
            .words($scope.cloudTags)
            .start();


            /*
            * Define o controle da Timeline
            */
            brush = d3.svg.brush()
            .x(x2)
            //.on("brush", brushing)
            .on("brushend", brushedend);

            /*
            * Define a linha para interpolação do gráfico principal
            */
            area = d3.svg.line()
            .interpolate("basic")
            .defined(function(d) { return d.y !== null; })
            .x(function(d) { return x(d.creat_at); })
            .y(function(d) { return y(d.y); });

            /*
            * Define a linha para interpolação do gráfico de controle da Timeline
            */
            area2 = d3.svg.line()
            .interpolate("basic")
            .defined(function(d) { return d.y !== null; })
            .x(function(d) { return x2(d.creat_at); })
            .y(function(d) { return y2(d.y); });

            /*
            * Renderiza o gráfico principal (degrade)
            */
            svg.append("svg:rect")
            .attr("width", visLine.width)
            .attr("height", visLine.height)
            .attr("class", "rectGradient")
            .style("fill", "#F6F6F6")
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
            removeLoader();
            renderLegend();
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
            x.domain(d3.extent($scope.lines.map(function(d) { return d.creat_at; })));
            x2.domain(x.domain());

            /*
            * Agrupa os tweets por sentimento
            */
            dataNest = d3.nest()
                .key(function(d) {return d.subject;}).sortKeys(d3.ascending)
                .entries($scope.lines);

            axisLabel = [];

            /*
            * Renderiza a linha do gráfico principal para cada assunto
            */
            dataNest.forEach(function(d, e) {
                axisLabel.push(d.key);

                focus.append("path")
                .datum(d.values)
                .attr("class", "area-g")
                .attr("stroke", function(){ return subjectLineColor(e); })
                .attr("d", area);
            });

            /*
            * Rendereiza a axis X (time) do gráfico principal
            */
            svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate("+ visLine.coord.x +"," + (visLine.coord.y + visLine.height) + ")")
            .call(xAxis);

        }

        /*
        * Renderiza a legenda do gráfico principal
        */
        function renderLegend(){
            var legendGroup = svg.append("g")
            .attr("class", "legendgroup")
            .attr("transform", "translate(0, 7)")
            ;

            legendGroup.append("text")
                .text("Assuntos: ")
                .style("font-size", visLine.legend.fontSize)
                .style("fill", "#777")
                .attr("dx", "15px")
                .attr("dy", ".40em")
                ;

            var legend = legendGroup.selectAll(".legend")
            .data(axisLabel)
            .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i){ return "translate("+ ((visLine.legend.width * i) + 80) +",0)"; })
            ;

            legend.append("rect")
                .attr("width", 10)
                .attr("height", 2)
                .attr("fill", function(d, i) { return subjectLineColor(i); })
            ;

            legend.append("text")
                .text(function(d) { return d; })
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
            var labelScale = d3.scale.ordinal()
            .domain($scope.visualization.sentiments.map(function(d){ return d.description; }))
            .rangePoints([0, visLine.height])
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
            .call(sentimentAxis)
            .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 5)
                .attr("x", -5)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Sentimentos ");
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
            * Renderiza a linha do gráfico de controle se tiver apenas um assunto
            */
            if( axisLabel.length < 2 ) {
                context.append("path")
                .datum($scope.lines)
                .attr("class", "area")
                .attr("d", area2);
            }

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
            
            focus.selectAll(".area-g")
            .transition().duration(visLine.transition.duration).ease(visLine.transition.ease)
            .attr("d", area);

            svg.select(".x.axis")
            .transition().duration(visLine.transition.duration).ease(visLine.transition.ease)
            .call(xAxis);
        }
        
        /*
        * Função callback responsável por renderizar as tags da Cloud Tag
        */
        function drawTags(words) {
            svg.append("g")
            .attr("transform", "translate("+( visLine.cloudTag.coord.x - 60 )+", "+ visLine.cloudTag.coord.y +")")
            .selectAll("text")
            .data(words)
            .enter()
                .append("text")
                .style("font-size", function(d) { return d.size + "px"; })
                .style("opacity", function(d) { return 1 - (0.01 * d.size); })
                .style("fill", function(d, i) { return scaleFontColor(i); })
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.word; });
        }

        /*
        * Função responsável por remover o loader da pagina
        */
        function removeLoader(){
            svg.selectAll(".loader").remove();
        }

        /*
        * Função responsável por resetar a seleção do gráfico de controle e atualizar o gráfico principal
        */
        $scope.clearBrushSelection = function() {
            d3.selectAll("g.brush").call(brush.clear());
            brushedend();
        }

    }

    controllers.controller('VisSingleLine', ['$scope', '$rootScope', '$routeParams', '$location', 'VisualizationFactory', 'TweetFactory', VisSingleLine]);
});