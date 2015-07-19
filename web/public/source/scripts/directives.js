/*
    Author: Andreas Älveborn
    URL: https://github.com/aelveborn/Wii-Scale

    This file is part of Wii-Scale

    ----------------------------------------------------------------------------
    
    The MIT License (MIT)
    
    Copyright (c) 2015 Andreas Älveborn
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
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
                        entries.remove(entry);
                    };

                    $scope.$watch('entries.list.length', function(newValue, oldValue) {
                        if(newValue === oldValue) {
                            return;
                        }
                        controlsHandler();
                    });
                }
            };
        }]);

})();