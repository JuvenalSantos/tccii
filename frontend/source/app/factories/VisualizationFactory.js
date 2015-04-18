define(['./module'], function (factories) {
	'use strict';

	var VisualizationFactory = function($resource){
		return $resource(baseURL + "visualization/:id/", {id:'@id'},{
			update : {
				method : "PUT"
			},			
			getFullVisualization: {
				method : "GET",
				params: {id: '@id', aggregation: '@aggregation'},
				url: baseURL + "visualization/full/:id/:aggregation"
			}
		});
	}

	factories.factory('VisualizationFactory', ['$resource', VisualizationFactory]);
});