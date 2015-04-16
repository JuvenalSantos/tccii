define(['./module'], function (factories) {
	'use strict';

	var TweetFactory = function($resource){
		return $resource(baseURL + "tweet/:id/", {id:'@id'},{
			update : {
				method : "PUT"
			},
			getTweetsEachFiveMinutes: {
				method : "GET",
				params: {id: '@id'},
				url: baseURL + "tweet/visualization/:id/",
				isArray: true
			}
		});
	}

	factories.factory('TweetFactory', ['$resource', TweetFactory]);
});