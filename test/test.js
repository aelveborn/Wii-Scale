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

var expect = require("chai").expect;

var User = require('../web/server/models/user.js');
var Users = require('../web/server/models/users.js');
var Entry = require('../web/server/models/entry.js');
var Entries = require('../web/server/models/entries.js');

var loki = require('lokijs'),
	db = new loki('test-data.json');

describe("Server", function () {

	describe("User", function () {
	
		it('should create a user', function() {
			var user = new User('John Doe');
			expect(user).to.have.property('name').and.to.equal('John Doe');
		});

	});

	describe("Users", function () {

		var users = null;

		beforeEach(function() {
			users = new Users(db.addCollection('users'));
		});

		it('should have created a new user instance', function () {			
			expect(users).to.not.be.equal(null);
		});

		it('should create a new collection if there is none', function () {
			expect(users.get()).to.not.equal(null);
		});

		it('should add a user', function() {
			users.add(new User("John Doe"));
			expect(users.get()).length(1);
		});

		it('should not add two users with the same name', function () {
			users.add(new User("John Doe"));
			users.add(new User("John Doe"));
			expect(users.get()).length(1);
		});

		it('should remove a user', function () {
			var user = new User("John Doe");

			users.add(user);
			expect(users.get()).length(1);
			
			users.remove(user);
			expect(users.get()).length(0);
		});

		it('should find a user', function () {
			var user = new User("John Doe");
			users.add(user);

			var result = users.findUserByName(user.name);
			expect(result).to.have.property('name').and.equal(user.name);
		});

		it('should not find a user', function() {
			var user = new User("John Doe");
			users.add(user);

			var result = users.findUserByName('');
			expect(result).to.equal(null);
		});
	});

	describe("Entry", function () {

		it('should create an entry', function () {
			var entry = new Entry('John Doe', 30);
			expect(entry).to.have.property('userName').and.equal('John Doe');
			expect(entry).to.have.property('weight').and.equal(30);
			expect(entry).to.have.property('dateTime').to.be.a('date');
		});

	});

	describe("Entries", function () {

		var entries = null;

		beforeEach(function() {
			entries = new Entries(db.addCollection('entries'));
		});

		it('should have created a new entries instance', function () {			
			expect(entries).to.not.be.equal(null);
		});

		it('should create a new collection if there is none', function () {
			expect(entries.get()).to.not.equal(null);
		});

		it('should add an entry', function () {
			var entry = new Entry('John Doe', 30);
			entries.add(entry);
			expect(entries.get()).length(1);
		});

		it('should remove entry', function () {
			var entry = new Entry('John Doe', 30);

			entries.add(entry);
			expect(entries.get()).length(1);

			entries.remove(entry);
			expect(entries.get()).length(0);
		});

		it('should remove all entries for user', function () {
			var user1 = new User('John Doe');
			var user2 = new User('Jane Doe');

			entries.add(new Entry(user1.name, 10));
			entries.add(new Entry(user1.name, 20));
			entries.add(new Entry(user2.name, 30));

			entries.removeUserEntries(user1);
			expect(entries.get()).length(1);
		});

		it('should get all users entries', function () {
			var user1 = new User('John Doe');
			var user2 = new User('Jane Doe');

			var entry1 = new Entry(user1.name, 10);
			var entry2 = new Entry(user1.name, 20);
			var entry3 = new Entry(user2.name, 30);
			var entry4 = new Entry(user2.name, 40);

			entries.add(entry1);
			entries.add(entry2);
			entries.add(entry3);
			entries.add(entry4);

			var result = entries.getUserEntries(user1);

			expect(result)
				.to.include(entry1)
				.and.to.include(entry2)
				.and.to.not.include(entry3)
				.and.to.not.include(entry4);
		});

	});
});