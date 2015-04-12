define(['../module'], function (controllers) {
    'use strict';

    var UserActivateController = function($scope, $location, $routeParams, UserFactory){
    	init();

		function init(){
			UserFactory.activate({id: $routeParams.id}).$promise.then(successHandler, failureHandler);
		}

		function successHandler(){
			swalSuccess("Usuário ativado com sucesso");
			$location.path("/User");
		}

		function failureHandler(result){
			swalError("Não foi possível ativar o usuário.\n"+getError(result));
			$location.path("/User");
		}
    }

    controllers.controller('UserActivateController', ['$scope', '$location', '$routeParams', 'UserFactory', UserActivateController]);
});