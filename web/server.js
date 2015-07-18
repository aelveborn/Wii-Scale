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
var server = require('http').Server(app);
var io = require('socket.io')(server);
var routes = require('./server/routes/index.js');

var host = process.env.npm_package_config_host;
var port = process.env.npm_package_config_port;

app.use('/static', require('express').static('web/public/build'));

// Routes
app.get('/', routes.index);
app.get('/directives/:page', routes.directives);
app.get('/partials/:page', routes.partials);

// Sockets
var socket = require('./server/routes/socket.js')(io);

exports.start = function() {
	server.listen(port, host, function(){
		console.log('Listening on ' + host + ':' + port);
	});
};