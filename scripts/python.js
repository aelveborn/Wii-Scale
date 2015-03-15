var PythonShell = require('python-shell');

var host = process.env.npm_package_config_host;
var port = process.env.npm_package_config_port;
var address = process.env.npm_package_config_address;
var calibrate = process.env.npm_package_config_calibrate;

var options = {
	scriptPath: 'wii-scale/',
	args: [
		'-h ' + host,
		'-p ' + port,
		'-a ' + address,
		'-c ' + calibrate
		]
}

exports.start = function() {
	PythonShell.run('wii-scale.py', options, function (error) {
		if (error) throw error;
	});
}