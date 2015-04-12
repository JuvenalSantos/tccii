require.config({
	baseUrl: 'app',
	urlArgs: 'v=0.1',
});

require(

	[
		'app',
		'routes',
		'constants',
		'factories/HttpInterceptor',
		'config/http-auth-interceptor'
	],
	function () {
		'use strict';
		angular.bootstrap(document, ['VInTApp']);
	});