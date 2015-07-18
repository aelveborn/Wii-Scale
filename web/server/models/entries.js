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

var Entry = require('./entry.js');
var storage = require('./storage.js');

var Entries = function(data) {
	this.entries = data.entries || [];
};

Entries.prototype.add = function(entry) {
	this.entries.push(entry);
};

Entries.prototype.get = function() {
	return this.entries;
};

Entries.prototype.remove = function(entry) {
	var result = [];

	for (var i = 0; i < this.entries.length; i++) {
		if(this.entries[i].dateTime !== entry.dateTime) {
			result.push(this.entries[i]);
		}
	}

	this.entries = result;
};

Entries.prototype.save = function() {
	// Save all entries
	var result = this.entries;
	storage.load(function(err, data) {
		if(err) throw err;
		data.entries = result;
		storage.save(data);
	});
};

module.exports = Entries;