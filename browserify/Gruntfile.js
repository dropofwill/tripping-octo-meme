'use strict';

module.exports = function(grunt) {
	// Load Plugins
	[ 'grunt-contrib-jshint',
		'grunt-contrib-watch',
		'grunt-browserify' ].forEach(grunt.loadNpmTasks);

	// Set Env Variables
	var browserifyFiles = { './build/scripts/bundle.js': ['./source/**/*.js'] };
	var sourceFiles = './source/**/*.js';

	// Configure Plugins
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		browserify: {
			dev: {
				files: browserifyFiles,
				options: { debug: true }
			},
			prod: {
				files: browserifyFiles,
				options: { debug: false }
			}
		},

		jshint: {
			files: [sourceFiles],
			options: { jshintrc: '.jshintrc' }
		},

		watch: {
			dev: {
				files: [sourceFiles],
				tasks: ['jshint', 'browserify:dev'],
			}
		}
	});
	
	grunt.registerTask('validate', ['jshint']);
	grunt.registerTask('dev', ['browserify:dev']);
	grunt.registerTask('prod', ['browserify:prod']);

	grunt.registerTask('default', ['jshint', 'browserify:dev']);
};
