define(['./module'], function (factories) {
	'use strict';

	var TweetFactory = function($resource){
		return $resource(baseURL + "tweet/:id/", {id:'@id'},{
			update : {
				method : "PUT"
			},
			getVisSingleLine: {
				method : "GET",
				params: {id: '@id', aggregation: '@aggregation'},
				url: baseURL + "tweet/vissingleline/:id/:aggregation",
				isArray: true
			},
			getVisMultiLine: {
				method : "GET",
				params: {id: '@id', aggregation: '@aggregation'},
				url: baseURL + "tweet/vismultiline/:id/:aggregation",
				isArray: true
			},
			getVisCircleTweets: {
				method : "GET",
				params: {id: '@id', timestamp: '@timestamp'},
				url: baseURL + "tweet/viscircle/:id/:timestamp",
				isArray: true
			},
			getVisCircleTweetsBySubject: {
				method : "GET",
				params: {id: '@id', timestamp: '@timestamp', subject: '@subject'},
				url: baseURL + "tweet/viscircle/:id/:timestamp/:subject",
				isArray: true
			}
		});
	}

	factories.factory('TweetFactory', ['$resource', TweetFactory]);
});