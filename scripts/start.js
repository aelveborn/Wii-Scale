var server = require('./server.js');
var python = require('./python.js');

// Starts Wii-Scale python application
python.start();

// Starts the webserver
server.start();