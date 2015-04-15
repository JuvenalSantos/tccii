define(['../module'], function (controllers) {
    'use strict';

    var LoadFileController = function($scope, $rootScope, $location, VisualizationFactory){
    	$scope.form = {};
        $scope.fileSelected = false;
        $scope.attachment = new FormData();


        $scope.openFileBrowser = function () {
            $('#import').trigger('click');
        }

        $scope.startImport = function() {
            if( !validForm() ) return;

            VisualizationFactory.save($scope.form, successHandler, errorHandler);
        }

        function successHandler(result) {
            swalSuccess("Importação de dados realizada com sucesso!");
            $location.path("/Home");

        }

        function errorHandler(result) {
            swalError(getError(result));
        }

        function validForm() {
            if( isNullBlank($scope.form.name) ) {
                swalInfo("O campo nome é obrigatório!");
                return false;
            }

            if( !$scope.isSelectedFile() ) {
                swalInfo("O arquivo de dados deve ser selecionado!");
                return false;
            }

            if( isNullBlank($scope.form.file) || $scope.form.sentiments == null ) {
                swalInfo("O arquivo selecionado é inválido!");
                return false;
            }

            var value;
            for(var i in $scope.form.sentiments) {
                value = $scope.form.sentiments[i];
                if( value.description == "" ) {
                    swalInfo("A escala de sentimentos deve possuir todos os sentimentos preenchidos.");
                    return false;
                }
            }
            
            return true;
        }

        $scope.uploadFile = function() {
            $('body').append("<div id='loader'></div>");
            $("#loader").css({"height" : $(window).height()});
            $.ajax({
                url: baseURL+'visualization/uploadfile',
                data: $scope.attachment,
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST',
                success: function(result){
                    $scope.form.file = result.file;
                    setSentimentScale(result.sentimentScale);
                    $scope.fileSelected = true;
                    $scope.$apply();
                },
                error: function(result) {
                    swalError(getError({data:result.responseJSON}));
                },
                complete: function() {
                    $('#loader').remove();
                }
            }); 
        }

        $("#import").change(function() {
            $scope.attachment = new FormData();
            $scope.attachment.append('file', $("#import")[0].files[0]);
            $scope.uploadFile();
        });

        function setSentimentScale(scale) {
            $scope.form.sentiments = new Array();
            angular.forEach(scale, function(value, key){
                this.push({
                    "sentiment": value,
                    "description": ""
                });

            }, $scope.form.sentiments);
        }

        $scope.deleteSelectedFile = function() {
            $scope.fileSelected = false;
            $scope.form.file = null;
            $scope.form.sentiments = null;
        }

        $scope.isSelectedFile = function() {
            return $scope.fileSelected;
        }

        function isNullBlank(elem) {
            return (elem == null) || (elem == 'undefined') || (elem == '');
        }
    }

    controllers.controller('LoadFileController', ['$scope', '$rootScope', '$location', 'VisualizationFactory', LoadFileController]);
});