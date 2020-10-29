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

    angular.module('app.controllers', []).

        controller('StartController', ['$scope', '$rootScope', 'socket', 'socketCommands', 'device', 'entries', function ($scope, $rootScope, socket, socketCommands, device, entries) {

            $scope.measuring = {
                count: 0,
                complete: 50,
                progress: 0,
                weight: 0
            };

            $scope.status = {

                start: false,
                search: false,
                ready: false,
                measuring: false,
                done: false,
                disconnecting: false,
                warning: false,

                dismiss: function() {
                    this.start = false;
                    this.search = false;
                    this.ready = false;
                    this.measuring = false;
                    this.done = false;
                    this.disconnecting = false;
                    this.warning = false;
                }
            };

            $scope.controls = {
                connect: true,
                disconnect: false
            };

            var init = function() {
                reset();
                $scope.controls.connect = true;
                $scope.controls.disconnect = false;

                $scope.status.dismiss();
                $scope.status.start = true;
            };

            function reset() {
                $scope.measuring.count = 0;
                $scope.measuring.complete = 50;
                $scope.measuring.progress = 0;
                setProgress();
            }         

            function done() {
                return $scope.measuring.count >= $scope.measuring.complete;
            }

            function setProgress() {
                var progress = Math.round(($scope.measuring.count / $scope.measuring.complete) * 100);
                if(progress <= 100) {
                    $scope.measuring.progress = progress;
                }        
            }


            // Device

            $scope.connect = function() {
                device.connect();
            };

            $scope.disconnect = function() {
                device.disconnect();

                $scope.status.dismiss();
                $scope.status.disconnecting = true; 
            };


            // From wii-scale

            function weightReading(totalWeight) {
                if(!done()) {     
                    $scope.measuring.weight = totalWeight;
                } else if ($scope.measuring.count === $scope.measuring.complete) {
                    $scope.measuring.weight = totalWeight;

                    entries.add($rootScope.selectedUser, totalWeight);

                    $scope.status.dismiss();
                    $scope.status.done = true;
                }

                setProgress();
                $scope.measuring.count++;            
            }


            // Socket

            socket.on(socketCommands.ENTRIES_RECEIVE_LIST, function(data) {
                if(data !== null && data !== undefined) {
                    $scope.entries = {};
                    $scope.entries.list = data;
                }
            });

            socket.on(socketCommands.WIISCALE_WEIGHT, function(data){
                weightReading(data.totalWeight.toFixed(1));
            });

            socket.on(socketCommands.WIISCALE_STATUS, function(data) {
                switch(data.status) {
                    case "CONNECTING":
                        $scope.status.dismiss();
                        $scope.status.search = true;

                        $scope.controls.connect = false;
                        $scope.controls.disconnect = true;
                        break;

                    case "NO DEVICE FOUND":
                        $scope.status.dismiss();
                        $scope.status.warning = true;

                        $scope.controls.connect = true;
                        $scope.controls.disconnect = false;
                        break;

                    case "CONNECTED":
                        reset();
                        $scope.status.dismiss();
                        $scope.status.ready = true;

                        $scope.controls.connect = false;
                        $scope.controls.disconnect = true;
                        break;

                    case "DISCONNECTED":
                        $scope.status.dismiss();
                        $scope.status.start = true;

                        $scope.controls.connect = true;
                        $scope.controls.disconnect = false;
                        break;

                    case "READY":
                        $scope.status.dismiss();
                        $scope.status.ready = true;

                        $scope.controls.connect = false;
                        $scope.controls.disconnect = true;
                        break;

                    case "MEASURING":
                        $scope.status.dismiss();
                        $scope.status.measuring = true;

                        $scope.controls.connect = false;
                        $scope.controls.disconnect = true;
                        break;

                    case "DONE":
                        reset();
                        break;

                    case "NO PREVIOUS STATUS":
                        init();
                        break;
                }
            });

        }]).

        controller('UserController', ['$scope', '$rootScope', '$cookies', 'socket', 'socketCommands', 'users', 'entries', function ($scope, $rootScope, $cookies, socket, socketCommands, users, entries){
            
            $scope.users = {};

            $scope.users.create = function() {
                if($scope.users.name !== undefined && $scope.users.name !== "") {

                    var user = {
                        name: $scope.users.name
                    };
                    users.add(user);

                    // Clear form
                    $scope.users.name = "";
                    $scope.users.select(user);

                }
            };

            $scope.users.remove = function(user) {
                $scope.users.removeUser = user;
            };

            $scope.users.select = function(user) {
                $rootScope.selectedUser = user;
                $cookies.putObject("selectedUser", $rootScope.selectedUser);
                entries.getUserEntries(user);
            };
            

            // Socket

            socket.on(socketCommands.USERS_RECEIVE_LIST, function(data) {
                $scope.users.list = data;
            });

        }]);

})();
