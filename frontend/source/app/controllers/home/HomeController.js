define(['../module'], function (controllers) {
    'use strict';

    var HomeController = function($scope, $rootScope, $location, VisualizationFactory){
    	$scope.visulalizations = [];

    	function init() {
            d3.selectAll("svg").remove();
    		VisualizationFactory.query({}, successHandler);
    	}
        init();

    	function successHandler(visualizations) {
    		$scope.visulalizations = visualizations;
    	}

    }

    controllers.controller('HomeController', ['$scope', '$rootScope', '$location', 'VisualizationFactory', HomeController]);
});