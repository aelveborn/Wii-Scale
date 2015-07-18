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

    angular.module('app.controllers', []).

        controller('StartController', ['$scope', 'socket', 'socketCommands', function ($scope, socket, socketCommands) {

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
                $scope.measuring = {
                    count: 0,
                    complete: 50,
                    progress: 0,
                    weight: 0 // TODO: Maybe not resetting this
                };
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
                socket.emit(socketCommands.DEVICE_CONNECT);
            };

            $scope.disconnect = function() {
                socket.emit(socketCommands.DEVICE_DISCONNECT);

                $scope.status.dismiss();
                $scope.status.disconnecting = true; 
            };


            // Entries

            function saveEntry(userName, weight) {
                socket.emit(socketCommands.ENTRIES_ADD, {userName: userName, weight: weight});
            }

            function getEntriesForUser(userName) {
                var user = {
                    name: userName
                };
                socket.emit(socketCommands.ENTRIES_USER, user);
            }


            // Users

            function saveUser(name) {
                var user = {
                    name: name
                };
                socket.emit(socketCommands.USERS_ADD, user);
            }

            function removeUser(name) {
                var user = {
                    name: name
                };
                socket.emit(socketCommands.USERS_REMOVE, user);
            }

            function selectUser(name) {
                // TODO: Get all entries for user
                getEntriesForUser(name);
            }


            // From wii-scale

            function weightReading(totalWeight) {       
                if(!done()) {     
                    $scope.measuring.weight = totalWeight;
                } else if (count === complete) {
                    $scope.measuring.weight = totalWeight;
                    saveEntry(0, totalWeight); // TODO: Changed from ID to username

                    $scope.status.dismiss();
                    $scope.status.done = true;
                }

                setProgress();
                $scope.measuring.count++;            
            }

            // Socket

            socket.on(socketCommands.USERS_RECEIVE_LIST, function(data) {
                // TODO: Implement
                console.log(data);
            });

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
                console.log(data.status); // TODO: Remove

                switch(data.status) {
                    case "SYNC":
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

                    case "CONNECTING":
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

        }]);

})();