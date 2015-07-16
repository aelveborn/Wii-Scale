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
			vendor: 		'node_modules/'
		},

		pkg: grunt.file.readJSON('package.json'),

		concat: {
			build: {
				files: {
				    '<%= path.dist.scripts %>scripts.js': [
				    	'<%= path.vendor %>jquery/dist/jquery.js',
				    	'<%= path.vendor %>angular/angular.js',
				    	'<%= path.vendor %>angular-socket-io/socket.js',
				    	'<%= path.vendor %>angular-route/angular-route.js',
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
				src: ['<%= path.src.scripts %>*.js', 
					'<%= path.root %>*.js', 
					'<%= path.server.root %>*.js',
					'gruntfile.js']
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

		watch: {
			js: {
				files: ['<%= path.src.scripts %>**/*.js'],
				tasks: ['jshint', 'concat', 'uglify']
			},
			jshint: {
				files: [
					'<%= path.server.root %>*.js',
					'<%= path.root %>*.js', 
					'gruntfile.js'
					],
				tasks: ['jshint']
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

	grunt.registerTask('default', ['build', 'watch']);
	grunt.registerTask('build', ['less', 'cssmin', 'jshint', 'concat', 'uglify', 'imagemin', 'copy']);
	grunt.registerTask('clean-build', ['clean', 'build']);

};