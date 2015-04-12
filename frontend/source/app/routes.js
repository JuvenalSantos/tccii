define(['app'], function (app) {
	'use strict';
	return app.config(['$routeProvider', function ($routeProvider) {

		$routeProvider
                  /* USER */
/*                  .when('/User', {templateUrl: 'app/view/user/User.html',controller: 'UserController'})
                  .when('/User/add', {templateUrl: 'app/view/user/UserAdd.html',controller: 'UserAddController'})
                  .when('/User/:id', {templateUrl: 'app/view/user/UserEdit.html',controller: 'UserEditController'})
                  .when('/User/remove/:id', {templateUrl: 'app/view/blank.html',controller: 'UserRemoveController'})
                  .when('/User/activate/:id', {templateUrl: 'app/view/blank.html',controller: 'UserActivateController'}) */
			
                  .when('/Home', {templateUrl: 'app/view/blank.html',controller: 'HomeController'})
                  .otherwise({redirectTo: '/Home'});
	}]);
});