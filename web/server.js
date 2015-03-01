var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/static', require('express').static(__dirname + '/static'));
app.use('/assets', require('express').static(__dirname + '/node_modules'));

app.get('/', function(req, res){
	res.sendfile('index.html');
});


io.on('connection', function(socket){

	// From Wii-Scale
	socket.on('status', function(data){
		io.emit('status data', data);
	});

	socket.on('weight', function(data){
		io.emit('weight data', data);
	});
});

http.listen(8080, function(){
	console.log('Listening on localhost:8080');
});