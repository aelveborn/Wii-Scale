module.exports = function (grunt) {
    
    grunt.initConfig({

    	path: {
			root: 			'web/',
			src: {
				root: 		'web/source/',
				less: 		'web/source/less/',
				styles: 	'web/source/styles/',
				scripts: 	'web/source/scripts/',
				images: 	'web/source/images/',
				views: 		'web/source/views/'
			},
			dist: {
				root: 		'web/build/',
				styles: 	'web/build/styles/',
				scripts: 	'web/build/scripts/',
				images: 	'web/build/images/',
				views: 		'web/build/views/'
			},
			vendor: 		'node_modules/'
		},

		pkg: grunt.file.readJSON('package.json'),

		concat: {
			build: {
				files: {
				    '<%= path.dist.scripts %>scripts.js': [
				    	'<%= path.vendor %>jquery/dist/jquery.js',
				    	'<%= path.vendor %>bootstrap/js/tooltip.js',
						'<%= path.vendor %>bootstrap/js/popover.js',
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
					'<%= path.dist.styles %>site.css': [ '<%= path.src.less %>sources.less']
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
				src: ['<%= path.src.scripts %>*.js']
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
			}
		},

		watch: {
			js: {
				files: ['<%= path.src.scripts %>**/*.js'],
				tasks: ['jshint', 'concat']
			},
			less: {
				files: ['<%= path.src.less %>**/*.less'],
				tasks: ['less'] 
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

	grunt.registerTask('default', ['less', 'jshint', 'concat', 'imagemin', 'copy']);
	grunt.registerTask('clean-build', ['clean', 'less', 'jshint', 'concat', 'imagemin', 'copy']);
	grunt.registerTask('release', ['clean', 'less', 'cssmin', 'jshint', 'concat', 'uglify', 'imagemin', 'copy']);

};