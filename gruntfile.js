/*
	Author: Andreas Älveborn
	URL: https://github.com/aelveborn/Wii-Scale

	This file is part of Wii-Scale
	Copyright (C) 2015 Andreas Älveborn

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

module.exports = function (grunt) {
	
	grunt.initConfig({

		path: {
			root: 			'web/',
			src: {
				root: 		'web/public/source/',
				less: 		'web/public/source/less/',
				styles: 	'web/public/source/styles/',
				scripts: 	'web/public/source/scripts/',
				images: 	'web/public/source/images/',
				views: 		'web/public/source/views/'
			},
			dist: {
				root: 		'web/public/build/',
				styles: 	'web/public/build/styles/',
				scripts: 	'web/public/build/scripts/',
				images: 	'web/public/build/images/',
				views: 		'web/public/build/views/'
			},
			server: {
				root: 		'web/server/'
			},
			vendor: 		'node_modules/',
			test: 			'test/'
		},

		pkg: grunt.file.readJSON('package.json'),

		concat: {
			build: {
				files: {
					'<%= path.dist.scripts %>scripts.js': [
						'<%= path.vendor %>jquery/dist/jquery.js',
						'<%= path.vendor %>bootstrap/js/dropdown.js',
						'<%= path.vendor %>bootstrap/js/modal.js',
						'<%= path.vendor %>angular/angular.js',
						'<%= path.vendor %>angular-socket-io/socket.js',
						'<%= path.vendor %>angular-route/angular-route.js',
						'<%= path.vendor %>angular-cookies/angular-cookies.js',
						'<%= path.vendor %>angular-animate/angular-animate.js',
						'<%= path.vendor %>chartist/dist/chartist.js',
						'<%= path.vendor %>chartist-plugin-pointlabels/dist/chartist-plugin-pointlabels.js',
						'<%= path.vendor %>save-csv/save-csv.js',
						'<%= path.src.scripts %>**/*.js'
						]
				}
			}
		},

		clean: {
			build: {
				src: ['<%= path.dist.root %>']
			}
		},

		less: {
			build: {
				files: {
					'<%= path.dist.styles %>site.css': [ '<%= path.src.less %>build.less']
				}
			}
		},

		cssmin: {
			build: {
				files: {
					'<%= path.dist.styles %>site.css': [ '<%= path.dist.styles %>site.css' ]
				}
			}
		},

		jshint: {
			build: {
				src: ['<%= path.src.scripts %>**/*.js', 'gruntfile.js']
			},
			server: {
				src: ['<%= path.server.root %>**/*.js', '<%= path.root %>*.js']
			},
			test: {
				src: ['<%= path.test %>**/*.js']
			}
		},

		uglify: {
			build: {
				src: ['<%= path.dist.scripts %>scripts.js'],
				dest: '<%= path.dist.scripts %>scripts.js'
			}
		},

		imagemin: {
			build: {
				files: [{
					expand: true,
					cwd: '<%= path.src.images %>',
					src: ['**/*.{png,jpg,gif}'],
					dest: '<%= path.dist.images %>'
				}]
			}
		},

		copy: {
			build: {
				expand: true,
				cwd: '<%= path.src.root %>',
				src: ['**', '!**/less/**', '!**/images/**', '!**/scripts/**'],
				dest: '<%= path.dist.root %>'
			},
			fontawesome: {
				expand: true,
				cwd: '<%= path.vendor %>/font-awesome/fonts/',
				src: '**',
				dest: '<%= path.dist.root %>/fonts/'
			}
		},

		simplemocha: {
			all: { 
				src: '<%= path.test %>**/*.js'
			}
		},

		watch: {
			js: {
				files: ['<%= path.src.scripts %>**/*.js'],
				tasks: ['jshint:build', 'concat', 'uglify']
			},
			js_server: {
				files: ['<%= path.server.root %>**/*.js', '<%= path.root %>*.js'],
				tasks: ['jshint:server', 'simplemocha']
			},
			test: {
				files: ['<%= path.test %>**/*.js'],
				tasks: ['jshint:test', 'simplemocha']
			},
			less: {
				files: ['<%= path.src.less %>**/*.less'],
				tasks: ['less', 'cssmin'] 
			},
			image: {
				files: ['<%= path.src.images %>**/*.{png,jpg,gif}'],
				tasks: ['imagemin']
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-cssmin');	
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-simple-mocha');

	grunt.registerTask('default', ['build', 'watch']);
	grunt.registerTask('build', ['less', 'cssmin', 'jshint:build', 'jshint:test', 'simplemocha', 'concat', 'uglify', 'imagemin', 'copy']);
	grunt.registerTask('clean-build', ['clean', 'build']);

};