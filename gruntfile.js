module.exports = function(grunt) {
	'use strict';
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
					onModuleBundleComplete: function ( data ) {
						var fs = require('fs'),
						amdclean = require('amdclean'),
						outputFile = data.path;

						fs.writeFileSync( outputFile, amdclean.clean( {
							filePath: outputFile,
							removeUseStricts: false,
							'wrap': {
								// This string is prepended to the file
								'start': ';(function( window, $body, $ ) {\n',
								// This string is appended to the file
								'end': '\n}( jQuery( window ), jQuery( "body" ), jQuery ));'
					},
				} ) );
					}
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
			}
		},
	});

	// register task
	grunt.registerTask( 'default', [ 'requirejs' ]);
	grunt.registerTask( 'auto', [ 'default', 'watch' ]);

};