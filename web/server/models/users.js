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

var storage = require('./storage.js');

var Users = function(data) {
	this.users = data.users || [];
};

Users.prototype.add = function(user) {
	this.users.push(user);
};

Users.prototype.get = function() {
	// Returns all users
	return this.users;
};

Users.prototype.remove = function(user) {
	var result = [];
	for (var i = this.users.length - 1; i >= 0; i--) {
		if(this.users[i].id !== user.id) {
			result.push(this.users[i]);
		}
	};
	this.users = result;
};

Users.prototype.newId = function() {
	var id = 0;
	for (var i = this.users.length - 1; i >= 0; i--) {
		if(this.users[i].id > id) {
			id = this.users[i].id;
		}
	};
	return ++id;
};


Users.prototype.findUserById = function(id) {
	// Returns User object
	for (var i = this.users.length - 1; i >= 0; i--) {
		if(this.users[i].id === id) {
			return this.users[i];
		};
	};
	return null;
};


Users.prototype.save = function() {
	// Save all users
	var result = this.users;
	storage.load(function(err, data) {
		if(err) throw err;
		data.users = result;
		storage.save(data);
	});
};

module.exports = Users;