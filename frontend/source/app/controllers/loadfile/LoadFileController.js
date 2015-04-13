define(['../module'], function (controllers) {
    'use strict';

    var LoadFileController = function($scope, $rootScope, $location, VisualizationFactory){
    	$scope.form = {};
        $scope.visulalizations = [];
        $scope.attachment = new FormData();

        function init() {
            
        }

        $scope.openFileBrowser = function () {
            $('#import').trigger('click');
        }

        $scope.startImport = function() {
            VisualizationFactory.save($scope.attachment, successHandler, errorHandler);
        }

        function successHandler(result) {
            console.log(result);
        }

        function errorHandler(result) {
            console.log(result);
        }

        $scope.uploadFile = function() {
            $.ajax({
                url: 'http://vint.dev/app_dev.php/api/visualization/uploadfile',
                data: $scope.attachment,
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST',
                success: function(result){

                },
                error: function(result) {
                    swalError("Ocorreu um erro!\n"+getError({data:result.responseJSON}));
                }
            }); 
        }

        $("#import").change(function() {
            $scope.attachment = new FormData();
            $scope.attachment.append('file', $("#import")[0].files[0]);
            $scope.uploadFile();
        });

    	init();
    }

    controllers.controller('LoadFileController', ['$scope', '$rootScope', '$location', 'VisualizationFactory', LoadFileController]);
});