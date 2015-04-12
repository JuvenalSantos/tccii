define(['app'], function (app) {
	'use strict';
	app.constant('USER_ROLES', {
        all: '*',
        admin: 'ROLE_ADMIN',
        user: 'ROLE_USER'
    });
});