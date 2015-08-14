module.exports = function(grunt) {
	'use strict';

	var fs = require('fs'),
		amdclean = require('amdclean'),
		convertRequireJsFiles = function ( data ) {
			var outputFile = data.path;

			fs.writeFileSync( outputFile, amdclean.clean( {
				filePath: outputFile,
				removeUseStricts: false,
				wrap: {
					// This string is prepended to the file
					'start': ';(function( window, $body, $ ) {\n',
					// This string is appended to the file
					'end': '\n}( jQuery( window ), jQuery( "body" ), jQuery ));'
				},
			} ) );
		};


	// load all grunt tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({

		requirejs: {
			dist: {
				options: {
					findNestedDependencies: true,
					optimize: 'none',
					baseUrl: '_assets/js',
					mainConfigFile: '_assets/js/config.js',
					out: 'assets/js/main.js',
					useStrict: true,
					onModuleBundleComplete: convertRequireJsFiles
				}
			}
		},

		 uglify: {
			options: {
				mangle: true
			},
			my_target: {
				files: {
					'assets/js/main.min.js': ['assets/js/main.js']
				}
			}
		},

		watch: {
			js: {
				files: [ '_assets/js/**/*.js', '_assets/js/**/**/*.js' ],
				tasks: [ 'requirejs' ],
				options: {
					spawn: false,
					livereload: 35729
				},
			},
			jsmin: {
				files:  ['assets/js/main.js'],
				tasks: [ 'uglify' ],
				options: {
					spawn: false,
					livereload: 35729
				},
			}
		},
	});

	// register task
	grunt.registerTask( 'default', [ 'requirejs', 'uglify' ]);
	grunt.registerTask( 'auto', [ 'default', 'watch' ]);

};