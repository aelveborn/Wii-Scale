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

        directive('graph', ['entries', function (entries){
            return {
                scope: {
                    entries: '='
                },
                restrict: 'E',
                replace: false,
                link: function($scope, iElm, iAttrs, controller) {

                    var margin = {top: 10, right: 10, bottom: 10, left: 10},
                    width = 700 - margin.left - margin.right,
                    height = 450 - margin.top - margin.bottom;

                    var defaultQuantity = 21;
                    var barWidth = width / defaultQuantity;
                    var svg = d3.select(iElm[0])
                        .append('svg')
                        .classed('svg-content-responsive', true)
                        .attr('viewBox', function(){ return '0 0 ' + (width) +' ' + (height); })
                        .attr('preserveAspectRatio', 'xMinYMin meet');

                    var barGraph = null;

                    function graphHandler() {
                        var data = $scope.entries.list.length > defaultQuantity ? $scope.entries.list.slice(-defaultQuantity) : $scope.entries.list;

                        var x = d3.time.scale()
                        	        .range([0, width])
                        	        .domain([ d3.min(data, function(d){ return +(new Date(d.dateTime));} ),
                    	                      d3.max(data, function(d){ return +(new Date(d.dateTime));} )]);
                    	var y = d3.scale.linear()
                    	            .range([height, 0])
                    	            .domain([25, 140]).nice();

                        if (barGraph === null) {
                            barGraph = svg.append('g')
                                .classed('bar-graph', true);
                        }

                        // DATA JOIN
                        // Join new data with any existing elements
                        var bars = barGraph.selectAll('g').data(data);

                        // UPDATE
                        // Update existing elements with new values
                        bars.transition()
                            .duration(750)
                            .attr("transform", function(d, i) { return "translate(" + (defaultQuantity - 1 - i) * barWidth + ",0)"; });

                        bars.select('rect')
                            .attr("height", function(d) { return height - y(d.weight); })
                            .transition()
                            .duration(750)
                                .attr("y", function(d) { return y(d.weight); });

                        bars.select('text')
                            .attr("y", -barWidth / 4)
                            .text(function(d) { return d.weight + " kg"; })
                            .transition()
                            .duration(750)
                                .attr("x", function(d) { return y(d.weight) + 5; });

                        // ENTER
                        // Create new elements as required
                        var barsEnter = bars.enter()
                                    .append('g')
                                    .attr("transform", function(d, i) { return "translate(" + (defaultQuantity - 1 - i) * barWidth + ",0)"; });

                        barsEnter.append('rect')
                            .attr("y", function(d) { return y(d.weight); })
                            .attr("width", barWidth - 1)
                            .style('fill-opacity', 1e-6)
                            .transition()
                            .duration(750)
                                .attr("height", function(d) { return height - y(d.weight); })
                                .style('fill-opacity', 1);

                        barsEnter.append('text')
                            .attr("y", -(barWidth / 4) + 2)
                            .attr('text-anchor', 'start')
                            .attr('transform', 'rotate(90)')
                            .classed('bar-text', true)
                            .text(function(d) { return d.weight + " kg"; })
                            .style('fill-opacity', 1e-6)
                            .transition()
                            .duration(750)
                                .attr("x", function(d) { return y(d.weight) + 5; })
                                .style('fill-opacity', 1);

                        // EXIT
                        // Remove elements that are no longer present in the data
                        bars.exit()
                            .transition()
                            .duration(500)
                                .style('fill-opacity', 1e-6)
                            .remove();

                    }

                    $scope.$watch('entries.list.length', function(newValue, oldValue) {
                        if(newValue === undefined) {
                            return;
                        }
                        graphHandler();
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
