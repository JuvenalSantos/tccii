function getError(request) {
    var data = request.data;
    if(data.errors) {
        return getErrorRec(data.errors);
    }
    if( data[0] ) {
        return data[0].message;
    }
    
    return "Erro desconhecido.";
}

function getErrorRec(children) {
    if(children.errors) {
        return children.errors[0];
    }
    if(children.children) {
        for(var child in children.children) {
            var r = getErrorRec(children.children[child]);
            if( r !== false)
                return r;
        }
    }
    return false;
}

var swalSuccess = function (text) {
    swal({
        title: config.sweetAlert.title.success,   
        text: text,   
        type: "success",
        timer: config.sweetAlert.timer,
        confirmButtonColor: config.sweetAlert.confirmButtonColor.blue
    });
};

var swalError = function (text) {
    swal({
        title: config.sweetAlert.title.error,   
        text: text,   
        type: "error",
        timer: config.sweetAlert.timer,
        confirmButtonColor: config.sweetAlert.confirmButtonColor.blue
    });
};

var swalInfo = function (text) {
    swal({
        title: config.sweetAlert.title.info,   
        text: text,   
        type: "info",
        timer: config.sweetAlert.timer,
        confirmButtonColor: config.sweetAlert.confirmButtonColor.blue
    });
};