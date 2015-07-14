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

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var host = process.env.npm_package_config_host;
var port = process.env.npm_package_config_port;

app.use('/static', require('express').static('web/build'));

app.get('/', function(req, res){
	res.sendfile('web/views/index.html');
});

// Mirror emits to communicate between the client and wii-scale
// wiiscale-* communicates with the Wii-Scale backend application

var NO_PREVIOUS_STATUS = "NO PREVIOUS STATUS";

var users = -1; // Start at negative one since wii-scale becomes a user
var last = { status: NO_PREVIOUS_STATUS };

io.on('connection', function(socket){

	// Server
	// -----------------------------------

	users++;

	// Send current status to new users
	socket.emit('wiiscale-status', last);

	// Disconnect wii-scale if no users is on the site
	socket.on('disconnect', function() {
		users--;
		if(users === 0) {
			last.status = NO_PREVIOUS_STATUS;
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

exports.start = function() {
	http.listen(port, host, function(){
		console.log('Listening on ' + host + ':' + port);
	});
};