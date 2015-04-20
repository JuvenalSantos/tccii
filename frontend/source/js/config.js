var config = {
    sweetAlert : {
        title : {
            error : "Ocorreu um erro!",
            success: "Sucesso!",
            info: "Aviso!",
            warning: "Atenção!"
        },
        timer: 10000,
        confirmButtonColor: {
            red: "#DD6B55",
            green: "#39BF5C",
            blue: "#399EBF"
        }
    }
};

var canvas = {
    width : $('body').width(),
    height : $('body').height() - 60,
    margin : {
        x : 30,
        y : 10
    },
    padding : 5,
    ctrlTime : {
        height : 50,
        resize : 5
    }
};

canvas.center = {
    x : canvas.width/2,
    y : canvas.height/2
};

var localizationConf = d3.locale({
    "decimal": ",",
    "thousands": ".",
    "grouping": [3],
    "currency": ["R$", ""],
    "dateTime": "%a %b %e %X %Y",
    "date": "%d/%m/%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
    "shortDays": ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    "months": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    "shortMonths": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
});
d3.time.format = localizationConf.timeFormat;