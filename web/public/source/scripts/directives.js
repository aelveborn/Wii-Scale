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

	angular.module('app.directives', []).

		directive('progressBar', function(){
			return {
				scope: {
					progress: '='
				},
				restrict: 'E',
				templateUrl: '/directives/progress-bar',
				replace: true
			};
		}).

		directive('status', function(){
			return {
				scope: {
					type: '@'
				},
				restrict: 'E',
				templateUrl: '/directives/status',
				replace: true,
				transclude: true
			};
		}).

		directive('history', ['entries', function (entries){
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
		}]).

		directive('lineChart', ['$filter', function ($filter){
			return {
				scope: {
					entries: '='
				},
				restrict: 'E',
				template: '<div class=\"ct-chart\"></div>',
				link: function($scope, iElm, iAttrs, controller) {

					function formatDate(date) {
						return $filter('date')(date, 'dd/MM');
					}

					var options = {
						showPoint: true,
						fullWidth: true,
						chartPadding: {
							bottom: 50,
							right: 40,
							left: 0
						},
						height: 180,
						axisX: {
							showLabel: true,
							labelOffset: {
								x: -16,
								y: 20
							},
							showGrid: false
						},
						axisY: {
							showLabel: false,
							showGrid: false,
						},						
					};

					var responsiveOptions = [
						['screen and (max-width: 767px)', {
							axisX: {
								showLabel: false
							},
						}],
						['screen and (min-width: 768px)', {
							axisX: {
								showLabel: true
							},
						}],
					];


					var loadData = function() {
						var set = 0;
						var data = {
							labels: [],
							series: [[]]
						};

						for (var i = $scope.entries.list.length - 1; i >= 0; i--) {
							data.labels.push(formatDate($scope.entries.list[i].dateTime));
							data.series[set].push($scope.entries.list[i].weight);

							if(($scope.entries.list.length - i) === 14) {
								i = 0;
							}
						}

						return data;						
					};

					function drawChart(data) {

						// Chart
						var chart = new Chartist.Line('.ct-chart', data, options, responsiveOptions);

						// Animation
						chart.on('draw', function(data) {
							if(data.type === 'line' || data.type === 'area') {
								data.element.animate({
									d: {
										begin: 2000 * data.index,
										dur: 2000,
										from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
										to: data.path.clone().stringify(),
										easing: Chartist.Svg.Easing.easeOutQuint
									}
								});
							}
						});

						// Tooltip
						var element =  angular.element(chart.container);
						var $toolTip = element
							.append('<div class="tooltip"></div>')
							.find('.tooltip')
							.hide();

						element.on('mouseenter', '.ct-point', function() {
							var $point = $(this);
							var value = $point.attr('ct:value');

							$toolTip.html(value + ' kg').show();
							$toolTip.css({
								left: $point.offset().left - (($toolTip.width() / 2) + 8),
								top: $point.offset().top - 40
							});							
						});

						element.on('mouseleave', '.ct-point', function() {
							$toolTip.hide();
						});
					}					

					$scope.$watch('entries.list.length', function(newValue, oldValue) {
						if(newValue === undefined) {
							return;
						}

						if($scope.entries.list.length > 1) {
							drawChart(loadData());
						}
					});

				}
			};
		}]);

})();