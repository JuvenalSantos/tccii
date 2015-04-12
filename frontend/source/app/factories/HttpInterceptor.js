define(['app'], function (app) {
    'use strict';

	var HttpInterceptor = function ($q, $rootScope, $location) {
		return {
			'request': function(config) {
				$('body').append("<div id='loader'></div>");
				$("#loader").css({"height" : $(window).height()});
				return config || $q.when(config);
			},
			'requestError': function(rejection) {
				$('#loader').remove();
				if (canRecover(rejection)) {
					return responseOrNewPromise
				}
				return $q.reject(rejection);
			},
			'response': function(response) {
				$('#loader').remove();
				return response || $q.when(response);
			},
	 
			// optional method
		 	'responseError': function(rejection) {
		 		$('#loader').remove();
		 		try{
			 		switch(rejection.status){
			 			case 400 :
			 				break;
						case 402 :
							break;
						case 404 :
							break;
			 			case 401 :
			 				//$rootScope.$broadcast('event:auth-Unauthorized', rejection);
			 				//console.log("Unauthorized");
			 				break;
			 			case 403 :
			 				//$rootScope.$broadcast('event:auth-Forbidden', rejection);
			 				//console.log("Forbiden");
			 				break;
			 			case 408 :
			 				//console.log("Timeout");
			 				break;
			 			case 412 :
			 				break;
			 			case 500 :
			 				break;
			 		}

					if (canRecover(rejection)) {
						return responseOrNewPromise;
					}
				}catch(err){
					//console.log("HttpInterceptor", err);
				}
				return $q.reject(rejection);
			}
		};
	};

	app.factory('HttpInterceptor', ['$q', '$rootScope', '$location', HttpInterceptor]);

});