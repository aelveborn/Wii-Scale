var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var debug = false;

app.use('/static', require('express').static(__dirname + '/static'));
app.use('/assets', require('express').static(__dirname + '/node_modules'));

app.get('/', function(req, res){
	res.sendfile('index.html');
});


io.on('connection', function(socket){
	if(debug)
		console.log('User connected');

	socket.on('disconnect', function(){
		if(debug) {
			console.log('User disconnected');
		}
	});

	// From Wii-Scale
	socket.on('status', function(data){
		if(debug) {
			console.log('Status: ' + data.status);
			console.log('Message: ' + data.message);
		}

		io.emit('status data', data);
	});

	socket.on('weight', function(data){
		if(debug) {
			console.log('Current weight:\t' + data.currentWeight);
			console.log('Total weight:\t' + data.totalWeight + '\n');
		}

		io.emit('weight data', data);
	});
});

http.listen(8080, function(){
	console.log('Listening on localhost:8080');
});