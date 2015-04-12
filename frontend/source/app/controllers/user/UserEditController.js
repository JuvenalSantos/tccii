define(['../module'], function (controllers) {
	'use strict';

	var UserEditController = function($scope, $routeParams, $location, AreaFactory, UserFactory){
		$scope.user = {};
		$scope.user.fk_perfil = 0;
		$scope.user.fk_pessoa = 1;
        $scope.user.area_area = {};
		$scope.areas = {};
        $scope.selectedAreas = {};
		$scope.perfis = {};
        init();

    	function init(){
            validationForm();
            
            AreaFactory.query({}, function(areas){
                $scope.areas = areas;
            })
            .$promise.then(function(){
                UserFactory.get({id: $routeParams.id}).$promise.then(function(data){
                    $scope.user = data;
                    $scope.user.fk_pessoa = 1;
                    //$scope.user.fk_pessoa = $scope.user.fk_pessoa.id_pessoa;
                    $scope.user.fk_perfil = $scope.user.fk_perfil.id_perfil;

                    $.each($scope.user.area_area, function(key, value){
                        $.each($scope.areas, function(key2, value2) {
                            if( value.id_area == value2.id_area ) {
                                value2.checked = true;
                            }
                        });
                    });
                });
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

			UserFactory.update({id:$routeParams.id}, $scope.user).$promise.then(successHandler, failureHandler);
		}

		function successHandler(){
			swalSuccess("Usuário editado com sucesso");
			$location.path("/User");
		}

		function failureHandler(result){
			swalError("Não foi possível editar o Usuário.\n"+getError(result));
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

	controllers.controller('UserEditController', ['$scope', '$routeParams', '$location', 'AreaFactory', 'UserFactory', UserEditController]);
});