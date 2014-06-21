module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    isRunningOnSnap: process.env.SNAP_CI,

    env: 'development',

    sites: {
      'development': 'http://dev.deliberare.com.br',
      'tests': 'http://tests.deliberare.com.br',
      'staging': 'http://staging.deliberare.com.br'
    },

    apps: {
      'development': 'agora_development',
      'tests': 'agora_tests',
      'staging': 'agora_staging'
    },

    bower: {
      install: {
        options: {}
      }
    },

    copy: {
      fonts: {
        files: [{
          expand: true,
          cwd: 'lib/assets/vendor/bower/bootstrap-sass-official/vendor/assets/fonts/bootstrap',
          src: ['*'],
          dest: 'parse/public/assets/fonts/bootstrap',
          filter: 'isFile'
        }, {
          expand: true,
          cwd: 'lib/assets/vendor/bower/fontawesome/fonts',
          src: ['*'],
          dest: 'parse/public/assets/fonts/fontawesome',
          filter: 'isFile'
        }]
      }
    },

    sass: {
      options: {
        includePaths: [
          'lib/assets/vendor/bower/bootstrap-sass-official/vendor/assets/stylesheets/bootstrap',
          'lib/assets/vendor/bower/fontawesome/scss',
          'lib/assets/css'
        ],
        outputStyle: 'compressed'
      },
      dist: {
        files: {
          'parse/public/assets/vendor.css': ['lib/assets/css/vendor-imports.scss'],
          'parse/public/assets/app.css': ['lib/assets/css/app.scss'],
          'parse/public/assets/site.css': ['lib/assets/css/site.scss']
        }
      }
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          cwd: 'lib/html/',
          src: ['**/*'],
          dest: 'parse/public/',
          filter: 'isFile'
        }]
      }
    },

    watch: {
      options: {
        nospawn: true
      },
      gruntfile: {
        files: ['Gruntfile.js', 'bower.json'],
        tasks: ['build']
      },
      html: {
        files: ['lib/html/**/*.html'],
        tasks: ['htmlmin']
      },
      styles: {
        files: ['lib/assets/css/**/*.scss'],
        tasks: ['sass']
      },
      vendor_js: {
        files: ['lib/assets/vendor/**/*.js'],
        tasks: ['uglify:vendor_js']
      },
      app_js: {
        files: ['lib/**/*.js', 'config/**/*.js', '!lib/assets/vendor/**/*.js'],
        tasks: ['uglify:app_js']
      }
    },

    uglify: {
      options: {
        mangle: false,
        sourceMap: true,
        sourceMapIncludeSources: true
      },

      vendor_js: {
        options: {
          separator: '\n;',
          compress: false,
          beautify: false
        },
        files: {
          'parse/public/assets/vendor.js': [
            'lib/assets/vendor/bower/jquery/dist/jquery.js',
            'lib/assets/vendor/bower/lodash/dist/lodash.js',
            'lib/assets/vendor/bower/angular/angular.js',
            'lib/assets/vendor/bower/angular-sanitize/angular-sanitize.js',
            'lib/assets/vendor/bower/momentjs/moment.js',
            'lib/assets/vendor/bower/angular-ui-router/release/angular-ui-router.js',
            'lib/assets/vendor/bower/angular-bootstrap/ui-bootstrap-tpls.js',
            'lib/assets/vendor/js/**/*.js'
          ]
        }
      },
      app_js: {
        options: {
          separator: '\n;',
          compress: false,
          beautify: false
        },
        files: {
          'parse/public/assets/config.js': ['lib/assets/js/config/<%= env %>.js'],
          'parse/public/assets/lib.js': [
            'lib/assets/js/app/**/*.js',
            'lib/assets/js/initializers/*.js',
            'lib/init_modules.js',
            'config/routes.js'
          ],
          'parse/public/assets/helpers.js': ['lib/helpers/*.js'],
          'parse/public/assets/models.js': ['lib/models/*.js'],
          'parse/public/assets/controllers.js': ['lib/controllers/*.js']
        }
      }
    },

    jsbeautifier: {
      files: [
        '**/*.js',
        '!db/parse.js', // why is this file duplicated here?
        '!lib/assets/vendor/**/*.js',
        '!node_modules/**/*.js'
      ],
      options: {
        js: {
          indentSize: 2,
          jslintHappy: true
        }
      }
    },

    jslint: {

      production: {
        directives: {
          browser: true,
          indent: 2,
          white: true,
          nomen: true,
          predef: [
            'angular',
            '_'
          ]
        },

        src: [
          '**/*.js',
          '!parse/**/*.js',
          '!*.js',
          '!*.conf.js',
          '!db/*.js',
          '!lib/assets/vendor/**/*.js',
          '!node_modules/**/*.js',
          '!spec/**/*.js'
        ]
      },

      test: {
        directives: {
          node: true,
          indent: 2,
          white: true,
          nomen: true,
          unparam: true,
          predef: [
            '_', 'window',
            'describe', 'it', 'browser', 'expect', 'beforeEach', 'spyOn', 'xit', 'jasmine', 'runs', 'waitsFor', // karma and jasmine
            'inject', 'angular', // angular
            'element', 'by' // webdriver
          ]
        },

        src: [
          'spec/**/*.js',
          '*.conf.js'
        ]
      },

      infrastructure: {
        directives: {
          node: true,
          indent: 2,
          white: true,
          nomen: true,
          unparam: true,
          predef: []
        },

        src: [
          '*.js',
          'db/*.js',
          '!db/parse.js',
          '!*.conf.js'
        ]
      }

    },

    protractor: {
      options: {
        keepAlive: false,
        noColor: false
      },
      test: {
        options: {
          configFile: 'e2e.conf.js'
        }
      }
    },

    karma: {
      watch_unit: {
        configFile: 'karma.conf.js',
        singleRun: false
      },
      run_unit: {
        configFile: 'karma.conf.js'
      }
    },

    exec: {
      clean: {
        command: 'rm -rf parse/public/*'
      },

      deploy: {
        command: "cd parse && parse deploy <%= apps[env] %> -d \"Deploying revision $(git rev-parse --short HEAD)\" > ../.deploy_output"
      },

      announce: {
        command: function () {
          var env = this.config.get('env'),
            sites = this.config.get('sites'),
            msg = "New version deployed to <" + sites[env] + "|the " + env + " environment> by `git config user.name`.",
            payload = JSON.stringify('{"channel": "#general", "icon_emoji": ":monkey_face:", "username": "deploy", "text": "' + msg + '"}'),
            command = 'curl -s -X POST --data-urlencode payload=' + payload + ' https://deliberare.slack.com/services/hooks/incoming-webhook?token=00AslaqafRD6hlO2YcGEpm4v';

          return 'OUTPUT=`cat .deploy_output | grep \'Not creating a release\'`; if [[ "$OUTPUT" = "" ]]; then ' + command + '; else echo $OUTPUT; fi';
        }
      }
    },

    htmlangular: {
      options: {
        reportpath: 'tmp/htmlangular-report.json',
        customattrs: [
          'test-name'
        ],
        relaxerror: [
          'Element img is missing required attribute src.' // ng-src is good enough in that case
        ]
      },

      all: {
        src: ['lib/html/**/*.html']
      }
    },

    imagemin: {
      src: {
        expand: true,
        cwd: 'lib/assets/images',
        src: ['*'],
        dest: 'parse/public/assets/images'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-html-angular-validate');
  grunt.loadNpmTasks('grunt-contrib-imagemin');

  // Build
  grunt.registerTask('build', ['exec:clean', 'bower:install', 'jsbeautifier', 'sass', 'htmlangular', 'htmlmin', 'uglify', 'imagemin', 'copy']);
  grunt.registerTask('build_for_tests', ['sass', 'imagemin', 'htmlmin', 'uglify', 'copy']);
  grunt.registerTask('default', ['build']);

  function setStagingEnvironment() {
    process.env.NODE_ENV = 'staging';
    grunt.config.set('env', 'staging');
  }

  function setTestsEnvironment() {
    process.env.NODE_ENV = 'tests';
    grunt.config.set('env', 'tests');
  }

  // Tests
  grunt.registerTask('tests_environment', 'Set tests environment', setTestsEnvironment);
  grunt.registerTask('staging_environment', 'Set staging environment', setStagingEnvironment);

  grunt.registerTask('prepare_for_test', ['tests_environment', 'build_for_tests'])
  grunt.registerTask('test_unit', ['prepare_for_test', 'karma:watch_unit']);
  grunt.registerTask('run_test_unit', ['prepare_for_test', 'karma:run_unit']);
  grunt.registerTask('test_functional', ['prepare_for_test', 'protractor:test']);

  // Deploy
  grunt.registerTask('deploy_to_development', ['build', 'exec:deploy', 'exec:announce']);
  grunt.registerTask('deploy_to_staging', ['staging_environment', 'build', 'exec:deploy', 'exec:announce']);
  grunt.registerTask('deploy_to_tests', ['tests_environment', 'build', 'exec:deploy', 'exec:announce']);

  grunt.registerTask('ci', ['tests_environment', 'build', 'run_test_unit', 'exec:deploy', 'exec:announce', 'test_functional']);
};
