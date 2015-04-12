define(['../module'], function (controllers) {
	'use strict';

	var UserRemoveController = function($scope, $routeParams, $location, UserFactory){
		init();

		function init(){
			UserFactory.remove({id: $routeParams.id}).$promise.then(successHandler, failureHandler);
		}

		function successHandler(){
			swalSuccess("Usuário excluído com sucesso");
			$location.path("/User");
		}

		function failureHandler(data){
			swalError("Não foi possível excluir o usuário, tente novamente mais tarde");
			$location.path("/User");
		}
	}

	controllers.controller('UserRemoveController', ['$scope', '$routeParams', '$location', 'UserFactory', UserRemoveController]);
});