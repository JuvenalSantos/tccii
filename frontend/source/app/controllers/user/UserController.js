define(['../module'], function (controllers) {
	'use strict';

	var UserController = function($scope, $rootScope, $location, UserFactory){
		$scope.users = {};
		$scope.empty = false;
		$scope.isCollapsed = true;
		init();

		function init(){
			UserFactory.query({}, successHandler);
		}

		function successHandler(users){
            $scope.empty = users.length == 0;
    		if( !$scope.empty ){
				$scope.users = users;
			}
		}

        $scope.isActive = function (status) {
            return (status == undefined);
        }

        $scope.searchAction = function() {
            UserFactory.search($scope.search, successHandler);
        }

        $scope.confirmRemove = function(location){
            confirmPrompt("Você deseja excluir o Usuário selecionado?", location);
        }

        $scope.confirmActivate = function(location){
            confirmPrompt("Você deseja ativar o Usuário selecionado?", location);
        }

        function confirmPrompt(text, location) {
            swal({   
                title: config.sweetAlert.title.warning,   
                text: text,   
                type: "warning",
                confirmButtonColor: config.sweetAlert.confirmButtonColor.red,
                showCancelButton: true,
                confirmButtonText: "Sim",
                cancelButtonText: "Não",
                closeOnConfirm: false
            }, function(isConfirm){
                if(isConfirm) {
                    $rootScope.$apply(function() {
                        $location.path(location);
                    });
                }
            }); 
        }
	}
	
	controllers.controller('UserController', ['$scope', '$rootScope', '$location', 'UserFactory', UserController]);
});