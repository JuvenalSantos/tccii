define([
    'controllers/index',
    'factories/index',
    'directives/index',
], function () {
    'use strict';

    var app =  angular.module('VInTApp', [
        'ngRoute',
        'ngResource',
        'ab-base64',
        'VInTApp.controllers',
        //'VInTApp.factories',
        'VInTApp.directives',
        'ui.bootstrap',
        'ngImgCrop',
        'ui.utils.masks',
        'validation', 
        'validation.rule',
    ]).config( function ($httpProvider, $validationProvider, USER_ROLES) {
        $httpProvider.interceptors.push('HttpInterceptor');
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        
        var defaultMsg = {
                required: {
                    error: 'Campo obrigatório',
                    success: ''
                }
            };
        $validationProvider.setDefaultMsg(defaultMsg);

        $validationProvider.showSuccessMessage = false;
        $validationProvider.setErrorHTML(function (msg) {
               return  "<label class=\"control-label has-error \">" + msg + "</label>";
        });

    }).run(function ($rootScope, $location, $http, $compile, USER_ROLES) {

    })

    return app;
});