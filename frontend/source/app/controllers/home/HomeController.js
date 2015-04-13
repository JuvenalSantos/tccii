define(['../module'], function (controllers) {
    'use strict';

    var HomeController = function($scope, $rootScope, $location, VisualizationFactory){
    	$scope.visulalizations = [];

    	function init() {
    		VisualizationFactory.query({}, successHandler);
    	}

    	function successHandler(visualizations) {
    		$scope.visulalizations = visualizations;
    	}

    	init();
    }

    controllers.controller('HomeController', ['$scope', '$rootScope', '$location', 'VisualizationFactory', HomeController]);
});