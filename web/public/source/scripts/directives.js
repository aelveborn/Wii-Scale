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
					$scope.controls.showDownload = true;
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
					
					// padLeft and dateFormat could be replaced with an angular filter
					function padLeft(num) {
						return (num<=9) ? "0" + num.toString() : num.toString();
					}
					
					function dateFormat(dtstr) {
						var dt = new Date(dtstr);
						return [ padLeft(dt.getMonth()+1), padLeft(dt.getDate()), dt.getFullYear()].join('/') + ' ' +
							[ padLeft(dt.getHours()), padLeft(dt.getMinutes()),	padLeft(dt.getSeconds())].join(':');
					}
					
					$scope.controls.download = function() {
						saveCsv($.map($scope.entries.list, function(value, index) {
							return {"Timestamp": dateFormat(value.dateTime), "Username": value.userName, "Weight (kg)": value.weight};
						}), {
							filename: "Wii-Scale_export_" + $scope.entries.list[0].userName + ".csv"
						});
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

		directive('deleteUserModal', ['$rootScope', '$cookies', 'entries', 'users', function ($rootScope, $cookies, entries, users){
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
						$cookies.putObject("selectedUser", $rootScope.defaultUser);
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

		directive('lineChart', ['$filter', '$rootScope', function ($filter, $rootScope){
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

						var graphStart = Math.min($scope.entries.list.length, 14);

						for (var i = graphStart - 1; i >= 0; i--) {
							data.labels.push(formatDate($scope.entries.list[i].dateTime));
							data.series[set].push($scope.entries.list[i].weight);
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
						var element = angular.element(chart.container);
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

					function removeGraph() {
						var chart = angular.element('.ct-chart');
						if(chart !== undefined) {
							chart.children().remove();
						}
					}

					function updateGraph() {
						if($scope.entries.list.length > 1) {
							drawChart(loadData());
						} else {
							removeGraph();
						}
					}

					$scope.$watch('entries.list', function(newValue, oldValue) {
						if(newValue === undefined) {
							return;
						}

						updateGraph();
					});

					$scope.$watch('$rootScope.selectedUser', function(newValue, oldValue) {
						if(newValue === oldValue) {
							return;
						}

						updateGraph();
					});

				}
			};
		}]);

})();