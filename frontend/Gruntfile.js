module.exports = function(grunt) {

  require('time-grunt')(grunt);
  grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),

	concat: {
		options: {
			separator: ';'
		},
		js: {
			src: ['temp/js/jquery.min.js', 
				  'temp/js/angular.min.js',
				  'temp/js/d3.min.js',
				  'temp/js/d3.layout.cloud.js',
				  'temp/js/index.js',
				  'temp/js/angular-route.min.js', 
				  'temp/js/angular-resource.min.js',
				  'temp/js/angular-locale_pt-br.js',
				  'temp/js/angular-utf8-base64.min.js',
				  'temp/js/bootstrap.min.js', 
				  'temp/js/ui-bootstrap-0.11.2.min.js', 
				  'temp/js/toastr.min.js', 
				  'temp/js/lodash.min.js', 
				  'temp/js/sweet-alert.min.js', 
				  'temp/js/raphael-min.js', 
				  'temp/js/morris.min.js', 
				  'temp/js/ng-img-crop.js',
				  'temp/js/jquery.mask.min.js',
				  'temp/js/jquery.validate.min.js',
				  'temp/js/jquery.inputmask.bundle.min.js',
				  'temp/js/masks.min.js',
				  'temp/js/config.js',
				  'temp/js/notifications.js',
				  'temp/js/validations.js',
				  'temp/js/angular-validation.min.js',
				  'temp/js/angular-validation-rule.min.js',
				  ],
			dest: 'dist/js/common.min.js'
		}
	},
	concat_css: {
		all: {
			src: ['temp/css/*.css'],
			dest: 'dist/css/common.min.css'
		},
	},
	copy: {
		vendorjs: {
			files: [
				{expand: true, flatten: true, cwd: "components/", 
					src: [
					'modernizr/modernizr.js', 
					'requirejs/require.js', 
					'q/q.js'
					], 
					dest: "dist/js"},
				{expand: true, flatten: true, cwd: "components/", 
					src: [
					'jquery/dist/jquery.min.js', 
					'angular/angular.min.js',
					'd3/d3.min.js',
					'd3-cloud/d3.layout.cloud.js',
					'd3-tip/index.js',
					'angular-route/angular-route.min.js', 
					'angular-resource/angular-resource.min.js',
					'angular-i18n/angular-locale_pt-br.js',
					'angular-utf8-base64/angular-utf8-base64.min.js',
					'bootstrap/dist/**/*.min.js', 
					'toastr/toastr.min.js', 
					'lodash/dist/lodash.min.js', 
					'sweetalert/lib/sweet-alert.min.js', 
					'angular-ui-bootstrap/dist/ui-bootstrap-0.11.2.min.js', 
					'morrisjs/morris.min.js', 
					'raphael/raphael-min.js', 
					'ngImgCrop/compile/minified/ng-img-crop.js',
					'jQuery-Mask-Plugin/dist/jquery.mask.min.js',
					'jquery-validation/dist/jquery.validate.min.js',
					'jquery.inputmask/dist/jquery.inputmask.bundle.min.js',
					'angular-input-masks/releases/masks.min.js',
					], 
					dest: "temp/js"},
				{expand: true, cwd: "node_modules/angular-validation/dist", src: '*.min.js', dest: "temp/js"},
				{expand: true, cwd: "components/bootstrap/dist/fonts", src: '**', dest: "dist/fonts"},
				{expand: true, cwd: "components/fontawesome/fonts", src: '**', dest: "dist/fonts"},
				{expand: true, cwd: "components/angular-ui-bootstrap/template", src: '**', dest: "dist/template"},
			]
		},
		vendorcss:{
			files: [
				{expand: true, flatten: true, cwd: "components/", src: ['bootstrap/dist/**/*.min.css'], dest: "temp/css"},
				{expand: true, flatten: true, cwd: "components/", src: ['toastr/toastr.min.css'], dest: "temp/css"},
				{expand: true, flatten: true, cwd: "components/", src: ['fontawesome/css/font-awesome.min.css'], dest: "temp/css"},
				{expand: true, flatten: true, cwd: "components/", src: ['morrisjs/morris.css'], dest: "temp/css"},
				{expand: true, flatten: true, cwd: "components/", src: ['sweetalert/lib/sweet-alert.css'], dest: "dist/css"},
				{expand: true, flatten: true, cwd: "components/", src: ['ngImgCrop/compile/minified/ng-img-crop.css'], dest: "temp/css"},
			]
		},
		projectHtml: {
			files: [
				{expand: true, cwd: "source/", src: ['*.html', 'app/view/*.html'], dest: "dist"},
			]
		},
		projectCss: {
			files: [
				{expand: true, flatten: true, cwd: "source/", src: ['css/*.css'], dest: "temp/css"},
			]
		},
		projectApp: {
			files: [
				{expand: true, cwd: "source/app", src: ['**/*'], dest: "dist/app"},
				{expand: true, flatten: true, cwd: "source/js", src: ['main.js', 'environment.js'], dest: "dist/js"},
				{expand: true, flatten: true, cwd: "source/js", src: ['config.js', 'notifications.js', 'validations.js'], dest: "temp/js"},
			]
		},
		projectFonts: {
			files: [
				{expand: true, flatten: true, cwd: "source/", src: ['fonts/**'], dest: "dist/fonts"},
			]
		},
		projectImages: {
			files: [
				{expand: true, flatten: true, cwd: "source/", src: ['images/**'], dest: "dist/images"},
			]
		}
	},
	clean: {
		temp: {
			src: ['temp']
		},
		dist: {
			src: ['dist']
		}
	},
	uglify: {
		options: {
			banner: '/*! JavaScript Minified File | <%= pkg.name %> - <%= pkg.version %> */\n',
			compress : false,
			stripBanners: true,
			mangle: false,
			preserveComments : false,
			beautify: true
			// banner: '/*! <%= pkg.name %> - <%= grunt.template.today("dd-mm-yyyy") %> */\n'
		},
		temp: {
			files: [
				{
					expand: true,
					cwd: 'temp/js',
					src: '*.js',
					dest: 'temp/js'
				}
			]
		}
		// dist: {
		// 	files: {
		// 	  'temp/*.js': ['<%= concat.dist.dest %>']
		// 	}
		// },
	},
	cssmin: {
		options: {
			//banner: '/* CSS Minified File | <%= pkg.name %> - <%= pkg.version %> */',
			keepSpecialComments: 0
		},
		temp: {
			files: [
				{
					expand: true,
					cwd: 'temp/css',
					src: '*.css',
					dest: 'temp/css'
				}
			]
		}
	},
	watch: {
		css: {
			files: ['source/css/*.css'],
			tasks: ['copy:vendorcss', 'copy:projectCss', 'cssmin', 'concat_css', 'clean:temp']
		},
		html: {
			files: ['source/*.html'],
			tasks: ['copy:projectHtml']
		},
		js: {
			files: ['source/app/**/*.js', 'source/js/*.js', 'source/app/**/*.html'],
			tasks: ['copy:projectApp']
		}
	},
	connect: {
		server: {
			options: {
				livereload: true,
				hostname: 'localhost',
				port: 9001,
				base: 'dist',
				keepalive: true
			}
		}
	}

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-concat-css');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('dev', ['clean:dist', 'copy', 'cssmin:temp', 'concat', 'concat_css', 'clean:temp', 'watch']);
  grunt.registerTask('build', ['clean:dist', 'copy', 'uglify:temp', 'cssmin:temp', 'concat', 'concat_css', 'clean:temp', 'watch']);
  grunt.registerTask('server', ['connect:server']);

};