/*
	Author: Andreas Älveborn
	URL: https://github.com/aelveborn/Wii-Scale

	This file is part of Wii-Scale
	Copyright (C) 2015 Andreas Älveborn
	Copyright (C) 2017 Matt Robinson

	This program is free software; you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation; either version 2 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License along
	with this program; if not, write to the Free Software Foundation, Inc.,
	51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

var spawn = require('child_process').spawn;

var host = process.env.npm_package_config_host;
var port = process.env.npm_package_config_port;
var calibrate = process.env.npm_package_config_calibrate;

var args = [
	'-h' + host,
	'-p' + port,
	'-c' + calibrate
]

exports.start = function() {
	child = spawn('build/wii-scale', args);

	child.stderr.on('data', function (data) {
		console.log(data.toString());
	});

	child.stdout.on('data', function (data) {
		console.log(data.toString());
	});
}
