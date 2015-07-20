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


var Entry = require('../models/entry.js');
var Entries = require('../models/entries.js');
var User = require('../models/user.js');
var Users = require('../models/users.js');

var users = null;
var entries = null;
var NO_PREVIOUS_STATUS = "NO PREVIOUS STATUS";


// Database

var loki = require('lokijs'),
	db = new loki('app-data.json', {
		autoload: true,
		autoloadCallback: loadHandler
	});

function loadUsers () {
	var userColl = db.getCollection('users');
	if(userColl === null) {
		userColl = db.addCollection('users');
	}
	users = new Users(userColl);
}

function loadEntries () {
	var entriesColl = db.getCollection('entries');
	if(entriesColl === null) {
		entriesColl = db.addCollection('entries');
	}
	entries = new Entries(entriesColl);
}

function loadHandler () {
	// Users
	loadUsers();

	// Entries
	loadEntries();
}


module.exports = function(io) {

	var cmd = Object.freeze({
		SOCKET_CONNECT: 			'connect',
		SOCKET_DISCONNECT: 			'disconnect',

        DEVICE_RCV_CONNECT:         'device connect',
        DEVICE_RCV_DISCONNECT:      'device disconnect',

        CLIENT_RCV_LOAD:  			'client load',

        USERS_RCV_ADD:              'users add',
        USERS_RCV_REMOVE:           'users remove',
        USERS_SEND_LIST:     		'users list',

        ENTRIES_RCV_ADD:            'entries add',
        ENTRIES_RCV_REMOVE:         'entries delete',
        ENTRIES_RCV_USER:           'entries user',
        ENTRIES_SEND_LIST:   		'entries list',

        WIISCALE_WEIGHT:        	'wiiscale-weight',
        WIISCALE_STATUS:        	'wiiscale-status',
        WIISCALE_SEND_CONNECT: 		'wiiscale-connect',
        WIISCALE_SEND_DISCONNECT: 	'wiiscale-disconnect',
    });

	var connectedUsers = -1; // Start at negative one since wii-scale becomes a user
	var lastCommand = { status: NO_PREVIOUS_STATUS };

	io.on(cmd.SOCKET_CONNECT, function(socket) {

		// Server
		// -----------------------------------

		connectedUsers++;
		
		// Disconnect wii-scale if no users is on the site
		socket.on(cmd.SOCKET_DISCONNECT, function() {
			connectedUsers--;
			if(connectedUsers === 0) {
				lastCommand.status = NO_PREVIOUS_STATUS;
				io.emit(cmd.WIISCALE_SEND_DISCONNECT);
			}
		});


		// From Client
		// -----------------------------------

		// Send initial data to client
		socket.on(cmd.CLIENT_RCV_LOAD, function () {
			// Send all saved entries to the user
			socket.emit(cmd.USERS_SEND_LIST, users.get());

			// Send current status to new users
			socket.emit(cmd.WIISCALE_STATUS, lastCommand);
		});

		// Connecto to hardware
		socket.on(cmd.DEVICE_RCV_CONNECT, function() {
			io.emit(cmd.WIISCALE_SEND_CONNECT);
		});

		// Disconnect device harware
		socket.on(cmd.DEVICE_RCV_DISCONNECT, function() {
			io.emit(cmd.WIISCALE_SEND_DISCONNECT);
		});

		// Save a new entry for user
		// params.userName 	string
		// params.weight 	int
		socket.on(cmd.ENTRIES_RCV_ADD, function(params) {
			var item = new Entry(params.userName, params.weight);
			entries.add(item);
			db.saveDatabase();

			var user = new User(params.userName);
			socket.emit(cmd.ENTRIES_SEND_LIST, entries.getUserEntries(user));
		});

		// Remove entry
		// entry 			entry
		socket.on(cmd.ENTRIES_RCV_REMOVE, function(entry) {
			entries.remove(entry);
			db.saveDatabase();

			var user = new User(entry.userName);
			socket.emit(cmd.ENTRIES_SEND_LIST, entries.getUserEntries(user));
		});

		// Requests all entries for the user
		// params.name 		string
		socket.on(cmd.ENTRIES_RCV_USER, function(params) {
			var user = new User(params.name);
			socket.emit(cmd.ENTRIES_SEND_LIST, entries.getUserEntries(user));
		});

		// Save new user
		// params.name 		string
		socket.on(cmd.USERS_RCV_ADD, function(params) {
			if(users.findUserByName(params.name) === null) {
				users.add(new User(params.name));
				db.saveDatabase();
				socket.emit(cmd.USERS_SEND_LIST, users.get());
			} else {
				// TODO: "User already exist"
			}
		});

		// Remove user
		// params.name 		string
		socket.on(cmd.USERS_RCV_REMOVE, function(params) {
			var user = users.findUserByName(params.name);
			if(user !== null) {
				users.remove(user);
				db.saveDatabase();
				socket.emit(cmd.USERS_SEND_LIST, users.get());
			} else {
				// TODO: "Could not find user"
			}			
		});


		// From Wii-Scale
		// -----------------------------------

		// Status from wii-scale
		// data.status 			string
		socket.on(cmd.WIISCALE_STATUS, function(data){
			io.emit(cmd.WIISCALE_STATUS, data);
			latestStatus = data;
		});

		// Measured weight from wii-scale
		// data.totalWeight 	int
		socket.on(cmd.WIISCALE_WEIGHT, function(data){
			io.emit(cmd.WIISCALE_WEIGHT, data);
		});
	});

};