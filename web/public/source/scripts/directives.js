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

    angular.module('app.directives', [])

        .directive('progressBar', function(){
            return {
                scope: {
                    progress: '='
                },
                restrict: 'E',
                templateUrl: '/directives/progress-bar',
                replace: true
            };
        })

        .directive('status', function(){
            return {
                scope: {
                    type: '@'
                },
                restrict: 'E',
                templateUrl: '/directives/status',
                replace: true,
                transclude: true
            };
        })

        .directive('history', ['entries', function (entries){
            return {
                scope: {
                    entries: '='
                },
                restrict: 'E',
                templateUrl: '/directives/history',
                replace: true,
                link: function($scope, iElm, iAttrs, controller) {

                    var defaultQuantity = 3;
                    $scope.quantity = defaultQuantity;
                    $scope.controls = {};
                    $scope.controls.showMore = false;
                    $scope.controls.showReset = false;

                    function controlsHandler() {
                        if($scope.entries !== undefined) {
                            if($scope.entries.list.length <= $scope.quantity || $scope.entries.list.length <= defaultQuantity) {
                                $scope.controls.showMore = false;
                            } else {
                                $scope.controls.showMore = true;
                            }

                            if($scope.quantity <= defaultQuantity) {
                                $scope.controls.showReset = false;
                            } else {
                                $scope.controls.showReset = true;
                            }
                        }

                        if($scope.entries.list.length < defaultQuantity) {
                            $scope.quantity = defaultQuantity;
                        }
                    }

                    $scope.controls.more = function() {
                        $scope.quantity += defaultQuantity;
                        controlsHandler();
                    };

                    $scope.controls.reset = function() {
                        $scope.quantity = defaultQuantity;
                        controlsHandler();
                    };

                    $scope.controls.remove = function(entry) {
                        $scope.removeEntry = entry;
                    };

                    $scope.$watch('entries.list.length', function(newValue, oldValue) {
                        if(newValue === oldValue) {
                            return;
                        }
                        controlsHandler();
                    });
                }
            };
        }]).

        directive('deleteUserModal', ['$rootScope', 'entries', 'users', function ($rootScope, entries, users){
            return {
                scope: {
                    user: '=',
                },
                restrict: 'E',
                templateUrl: '/directives/delete-user-modal',
                link: function($scope, iElm, iAttrs, controller) {

                    $scope.deleteUser = function(user) {
                        users.remove(user);

                        $rootScope.selectedUser = $rootScope.defaultUser;
                        entries.getUserEntries($rootScope.defaultUser);
                    };

                    $scope.$watch(iAttrs.visible, function(value){
                        if(value === true) {
                            $(iElm).modal('show');
                        } else {
                            $(iElm).modal('hide');
                        }
                    });

                    $(iElm).on('shown.bs.modal', function(){
                        $scope.$apply(function(){
                            $scope.$parent[iAttrs.visible] = true;
                        });
                    });

                    $(iElm).on('hidden.bs.modal', function(){
                        $scope.$apply(function(){
                            $scope.$parent[iAttrs.visible] = false;
                        });
                    });
                }
            };
        }]).

        directive('deleteEntryModal', ['$rootScope', 'entries', 'users', function ($rootScope, entries, users){
            return {
                scope: {
                    entry: '=',
                },
                restrict: 'E',
                templateUrl: '/directives/delete-entry-modal',
                link: function($scope, iElm, iAttrs, controller) {

                    $scope.deleteEntry = function(entry) {
                        entries.remove(entry);
                    };

                    $scope.$watch(iAttrs.visible, function(value){
                        if(value === true) {
                            $(iElm).modal('show');
                        } else {
                            $(iElm).modal('hide');
                        }
                    });

                    $(iElm).on('shown.bs.modal', function(){
                        $scope.$apply(function(){
                            $scope.$parent[iAttrs.visible] = true;
                        });
                    });

                    $(iElm).on('hidden.bs.modal', function(){
                        $scope.$apply(function(){
                            $scope.$parent[iAttrs.visible] = false;
                        });
                    });
                }
            };
        }]);

})();