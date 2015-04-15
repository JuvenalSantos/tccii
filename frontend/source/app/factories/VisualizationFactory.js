define(['./module'], function (factories) {
	'use strict';

	var VisualizationFactory = function($resource){
		return $resource(baseURL + "visualization/:id/", {id:'@id'},{
			update : {
				method : "PUT"
			}
		});
	}

	factories.factory('VisualizationFactory', ['$resource', VisualizationFactory]);
});