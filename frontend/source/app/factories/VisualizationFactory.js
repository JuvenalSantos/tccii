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
			},
			getFullVisBubble: {
				method : "GET",
				params: {id: '@id', retweets: '@retweets'},
				url: baseURL + "visualization/visbubble/:id/:retweets"
			}
		});
	}

	factories.factory('VisualizationFactory', ['$resource', VisualizationFactory]);
});