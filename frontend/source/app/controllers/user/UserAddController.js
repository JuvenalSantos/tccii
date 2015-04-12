define(['../module'], function (controllers) {
	'use strict';

	var UserAddController = function($scope, $location, UserFactory, AreaFactory){
		$scope.user = {};
		$scope.user.fk_perfil = 0;
		$scope.user.fk_pessoa = 1;
		$scope.areas = {};
		$scope.perfis = {};
        init();

    	function init(){
            validationForm();

    		AreaFactory.query({}, function(areas){
    			$scope.areas = areas;
    		});
    	}

		$scope.save = function(){
            if( !$("#form").valid() ) {
                return false;
            }

            if( $scope.user.fk_perfil == 0 ) {
                swalError("O campo pefil é obrigatório.");
                return false;
            } 

            $scope.user.area_area = [];
            $("input[name='areas[]']:checked").each(function(){ 
                $scope.user.area_area.push( $(this).val() ); 
            });
            
			UserFactory.save($scope.user).$promise.then(successHandler, failureHandler);
		}

		function successHandler(){
			swalSuccess("Usuário cadastrado com sucesso");
			$location.path("/User");
		}

		function failureHandler(result){
			swalError("Não foi possível cadastrar o Usuário.\n"+getError(result));
		}

        function validationForm() {
            $("#form").validate({
                onsubmit: false,
                rules:{
                    email: {
                        email: true
                    }
                },
                messages: {
                    email: {
                        email: "Informe um email válido."
                    }
                }
            });
        }
	}

	controllers.controller('UserAddController', ['$scope', '$location', 'UserFactory', 'AreaFactory', UserAddController]);
});