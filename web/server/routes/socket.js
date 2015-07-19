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


var loki = require('lokijs'),
	db = new loki('app-data.json');

var Entry = require('../models/entry.js');
var Entries = require('../models/entries.js');
var User = require('../models/user.js');
var Users = require('../models/users.js');

var NO_PREVIOUS_STATUS = "NO PREVIOUS STATUS";


module.exports = function(io) {

	var connectedUsers = -1; // Start at negative one since wii-scale becomes a user
	var lastCommand = { status: NO_PREVIOUS_STATUS };

	var users = new Users(db.getCollection('users') || db.addCollection('users'));
	var entries = new Entries(db.getCollection('entries') || db.addCollection('entries'));

	io.on('connection', function(socket) {

		// Server
		// -----------------------------------

		connectedUsers++;

		// Send all saved entries to the user
		socket.emit('users list', users.get());

		// Send current status to new users
		socket.emit('wiiscale-status', lastCommand);
		
		// Disconnect wii-scale if no users is on the site
		socket.on('disconnect', function() {
			connectedUsers--;
			if(connectedUsers === 0) {
				lastCommand.status = NO_PREVIOUS_STATUS;
				io.emit('wiiscale-disconnect');
			}
		});


		// From Client
		// -----------------------------------

		socket.on('device connect', function() {
			io.emit('wiiscale-connect');
		});

		socket.on('device disconnect', function() {
			io.emit('wiiscale-disconnect');
		});

		socket.on('entries add', function(params) {
			var item = new Entry(params.userName, params.weight);
			entries.add(item);
			db.saveDatabase();
			socket.emit('entries list', entries.get());
		});

		socket.on('entries delete', function(entry) {
			entries.remove(entry);
			db.saveDatabase();
			socket.emit('entries list', entries.get());
		});

		socket.on('entries user', function(params) {
			var user = new User(params.name);
			socket.emit('entries list', entries.getUserEntries(user));
		});

		socket.on('users add', function(params) {
			if(users.findUserByName(params.name) === null) {
				users.add(new User(params.name));
				db.saveDatabase();
				socket.emit('users list', users.get());
			} else {
				// TODO: "User already exist"
			}
		});

		socket.on('users remove', function(params) {
			var user = users.findUserByName(params.name);
			if(user !== null) {
				users.remove(user);
				db.saveDatabase();
				socket.emit('users list', users.get());
			} else {
				// TODO: "Could not find user"
			}			
		});


		// From Wii-Scale
		// -----------------------------------

		// Status from wii-scale
		// data.status 			string
		socket.on('wiiscale-status', function(data){
			io.emit('wiiscale-status', data);
			latestStatus = data;
		});

		// Measured weight from wii-scale
		// data.totalWeight 	int
		socket.on('wiiscale-weight', function(data){
			io.emit('wiiscale-weight', data);
		});
	});

};