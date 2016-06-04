'use strict';

var request = require('request');
var fs = require('fs');

module.exports = function (grunt) {

	require('time-grunt')(grunt);

	// Project configuration.
	grunt.initConfig({


		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//constants used in this config
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		config: {
			project_name       	: '',
			src                	: 'src',
			dist               	: 'dist',
			locales            	: 'locales',
			google_document_key	: '1gA-5lpURCmllQAuTkc5vDvAv6Y4eXJDyr8XS-QJntes',
			default_locale     	: 'en',
			language_column1    : 'en',
			language_column2    : 'fr',
			language_column3    : 'es',
			AWSbucket          	: '',
			AWSregion          	: 'eu-west-1',
			AWSAccessKeyId     	: '',
			AWSSecretKey       	: ''
		},


		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//s3 upload
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////


		aws_s3: {
			options: {
				accessKeyId        : '<%= config.AWSAccessKeyId %>',
				secretAccessKey    : '<%= config.AWSSecretKey %>',
				region             : '<%= config.AWSregion %>',
				uploadConcurrency  : 5, // 5 simultaneous uploads
				downloadConcurrency: 5 // 5 simultaneous downloads,
			},
			build  : {
				options: {
					bucket      : '<%= config.AWSbucket %>',
					differential: true, // Only uploads the files that have changed
					gzipRename  : 'ext' // when uploading a gz file, keep the original extension
				},
				files  : [
					{expand: true, cwd: 'dist', src: ['**'], dest: '/', action: 'upload'}
				]
			}
		},


		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//convert google spreadsheets to json
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////


		i18n_gspreadsheet: {
			options    : {
				document_key              : '<%= config.google_document_key %>',
				key_column                : 'key',
				default_locale            : '<%= config.default_locale %>',
				write_default_translations: true
			},
			your_target: {}
		},

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//convert locales
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		convert: {
			options: {
				explicitArray: false
			},
			a2json: {
				src : ['locales/<%= config.language_column1 %>.js'],
				dest: 'locales/<%= config.language_column1 %>.json'
			},
			b2json: {
				src : ['locales/<%= config.language_column2 %>.js'],
				dest: 'locales/<%= config.language_column2 %>.json'
			},
			c2json: {
				src : ['locales/<%= config.language_column3 %>.js'],
				dest: 'locales/<%= config.language_column3 %>.json'
			}
		},

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//watch
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////


		watch: {
			bower     : {
				files: ['bower.json'],
				tasks: ['wiredep']
			},
			assemble  : {
				files: ['<%= config.src %>/templates/**/*.*'],
				tasks: ['refresh']

			},
			sass      : {
				files: ['<%= config.src %>/styling/**/*.*'],
				tasks: [
					'copy',
					'sass',
					'concat:css',
					'cssmin'
				]
			},
			js        : {
				files: ['<%= config.src %>/scripts/**/*.*'],
				tasks: [
					'concat:jsread'
				]
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files  : [
					'<%= config.dist %>/{,*/}*.html',
					'<%= config.dist %>/css/styles.css',
					'<%= config.dist %>/js/scripts.js',
					'<%= config.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
					'<%= config.dist %>/fonts/{,*/}*.{eot,svg,ttf,woff,woff2}'
				]
			}
		},

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//livereload settings
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////


		connect: {
			options: {
				port      : 9999,
				livereload: 35725,
				// change this to '0.0.0.0' to access the server from outside
				hostname  : 'localhost'
			},
			livereload: {
				options: {
					open: true,
					base: [
						'<%= config.dist %>'
					]
				}
			}
		},


		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//clean stuff
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		clean: {
			dist   : {
				src: ['<%= config.dist %>']
			},
			tmp    : {
				src: ['.tmp']
			},
			build  : {
				src: [
					"<%= config.dist %>",
					".tmp"
				]
			},
			locales: {
				src: ["locales"]
			}

		},

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//copy stuff
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		copy: {

			images: {
				expand : true,
				flatten: true,
				cwd    : '<%= config.src %>/images/',
				src    : '*.{png,jpg,jpeg,gif,webp,svg}',
				dest   : '<%= config.dist %>/images'
			},
			fonts : {
				expand : true,
				flatten: true,
				cwd    : '<%= config.src %>/fonts/',
				src    : '*.*',
				dest   : '<%= config.dist %>/fonts'
			},
			files : {
				expand : true,
				flatten: true,
				cwd    : '<%= config.src %>/files/',
				src    : '*.*',
				dest   : '<%= config.dist %>/files'
			}

		},

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//sass
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////


		sass: {
			options: {
				sourceMap: false,
				style    : 'compact'
			},
			dist   : {
				files: {
					'.tmp/styling/main.css': '<%= config.src %>/styling/main.scss'
				}
			}
		},

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//put stuff together
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////


		concat: {
			css   : {
				options: {
					separator: ''
				},
				src    : '.tmp/styling/*.css',
				dest   : '<%= config.dist %>/css/styles.css'
			},
			js    : {
				options: {
					separator: ';'
				},
				src    : '<%= config.src %>/scripts/**/*.js',
				dest   : '<%= config.dist %>/js/scripts.js'
			},
			jsread: {
				options: {
					separator: "\n\n\n/////////////////////////////////////////////////////////////////////////\n\n\n\n"
				},
				src    : '<%= config.src %>/scripts/**/*.js',
				dest   : '<%= config.dist %>/js/scripts.js'
			}

		},

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//make stuff smaller
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////


		cssmin: {
			dist: {
				files: {
					'<%= config.dist %>/css/styles.css': '<%= config.dist %>/css/*.css'
				}
			}
		},

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//create static pages
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////


		assemble: {
			pages: {
				options: {
					flatten : true,
					assets  : '<%= config.dist %>',
					layout  : '<%= config.src %>/templates/layouts/default.hbs',
					partials: [
						'<%= config.src %>/templates/partials/*.hbs',
						'<%= config.src %>/templates/content/*.md',
						'<%= config.src %>/templates/sections/*.hbs',
						'<%= config.src %>/templates/modals/*.hbs'
					],
					plugins : [
						'assemble-contrib-permalinks',
						'assemble-contrib-sitemap'
					]
				},
				files  : {
					'<%= config.dist %>/': ['<%= config.src %>/templates/pages/*.hbs']
				}
			}
		},

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//make html small
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		htmlmin: {
			dist: {
				options: {
					collapseWhitespace       : true,
					conservativeCollapse     : true,
					collapseBooleanAttributes: true,
					removeCommentsFromCDATA  : true,
					removeOptionalTags       : false
				},
				files  : [
					{
						expand: true,
						cwd   : '<%= config.dist %>',
						src   : '{,*/}*.html',
						dest  : '<%= config.dist %>'
					}
				]
			}
		},


		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//create static translations of everything
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		i18n: {
			dist   : {
				options: {
					baseDir  : '<%= config.dist %>',
					outputDir: '<%= config.dist %>'
				}
			},
			options: {
				selector   : '[translate]',
				fileFormat : 'json',
				exclude    : ['components/'],
				locales    : [
					'<%= config.language_column1 %>',
					'<%= config.language_column2 %>',
					'<%= config.language_column3 %>'
				],
				locale     : '<%= config.language_column1 %>',
				localesPath: '<%= config.locales %>'
			}
		},

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//scramble js
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		uglify: {
			js: {
				files: {
					'<%= config.dist %>/js/scripts.js': ['<%= config.dist %>/js/scripts.js']
				}
			}
		},


		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//bower inject
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		bower_concat: {
			all: {
				dest        : '<%= config.dist %>/js/bower.js',
				cssDest     : '<%= config.dist %>/css/bower.css',
				exclude     : [],
				dependencies: {
					'bootstrap': 'jquery'
				},
				bowerOptions: {
					relative: false
				}
			}
		},

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//imagemin
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		imagemin: {
			dist: {
				options: {
					optimizationLevel: 7,
					svgoPlugins      : [{removeViewBox: false}]
				},
				files  : [
					{
						expand : true,
						flatten: true,
						cwd    : 'src/images',
						src    : '{,*/}*.{png,jpg,jpeg,gif}',
						dest   : 'dist/images'
					}
				]
			}
		}


	});


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//load npm tasks
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////


	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-convert');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-i18n-static');
	grunt.loadNpmTasks('grunt-json');
	grunt.loadNpmTasks('grunt-i18n-gspreadsheet');
	grunt.loadNpmTasks('assemble-contrib-permalinks');
	grunt.loadNpmTasks('assemble-contrib-sitemap');
	grunt.loadNpmTasks('handlebars-helper-md');
	grunt.loadNpmTasks('assemble');
	grunt.loadNpmTasks('grunt-bower-concat');
	grunt.loadNpmTasks('grunt-aws-s3');


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//general tasks
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////


	grunt.registerTask('build', [
		'clean',
		'bower_concat',
		'copy:files',
		'copy:fonts',
		'imagemin',
		'sass',
		'concat:css',
		'cssmin',
		'concat:js',
		'assemble',
		'htmlmin',
		'uglify',
		'getlanguages',
		'i18n',
		'clean:tmp',
		// 'aws_s3'
	]);


	grunt.registerTask('refresh', [
		'clean',
		'bower_concat',
		'copy',
		'sass',
		'concat:css',
		'concat:jsread',
		'cssmin',
		'assemble',
		'getlanguages',
		'i18n'
	]);

	grunt.registerTask('serve', [

		'clean',
		'copy',
		'bower_concat',
		'sass',
		'concat:css',
		'concat:jsread',
		'cssmin',
		'assemble',
		'getlanguages',
		'i18n',
		'connect:livereload',
		'watch'
	]);



	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//get languages using google spreadsheet
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////


	grunt.registerTask('getlanguages', [
		'clean:locales',
		'i18n_gspreadsheet',
		'convert'

	]);


};
