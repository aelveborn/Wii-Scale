/*
    Author: Andreas Älveborn
    URL: https://github.com/aelveborn/Wii-Scale

    This file is part of Wii-Scale
    Copyright (C) 2015 Andreas Älveborn

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

(function() {
    'use strict';

    angular.module('app', [
        'ngRoute',
        'ngAnimate',
        'btford.socket-io',
        'app.controllers',
        'app.directives',
        'app.services'
    ]).

    run(['$rootScope', 'entries', 'client', function ($rootScope, entries, client) {
        var defaultUser = {
            name: "Guest"
        };
        $rootScope.defaultUser = defaultUser;
        $rootScope.selectedUser = defaultUser;
        entries.getUserEntries(defaultUser);
        client.load();
    }]).

    config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

        $routeProvider.
            when('/', {
                templateUrl: '/partials/start'
            }).
            when('/settings', {
                templateUrl: '/partials/settings'
            }).
            otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode(true);
    }]);

})();