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

app.use('/assets', require('express').static('web/build'));
app.use('/vendor', require('express').static('node_modules'));

app.get('/', function(req, res){
	res.sendfile('web/views/index.html');
});

io.on('connection', function(socket){

	// From Client
	socket.on('device search', function() {
		io.emit('sleep', false);
	});

	socket.on('device sleep', function() {
		io.emit('sleep', true);
	});

	// From Wii-Scale
	socket.on('status', function(data){
		io.emit('status data', data);
	});

	socket.on('weight', function(data){
		io.emit('weight data', data);
	});

});

exports.start = function() {
	http.listen(port, host, function(){
		console.log('Listening on ' + host + ':' + port);
	});
}