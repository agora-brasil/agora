module.exports = function (grunt) {
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
          dest: 'parse/public/assets/bootstrap/',
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
          'parse/public/assets/app.css': ['lib/assets/css/app.scss']
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
        }, ]
      },
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
        mangle: false
        /*,
        sourceMap: true,
        sourceMapIncludeSources: true*/
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
            'lib/assets/vendor/bower/angular-ui-router/release/angular-ui-router.js',
            // 'lib/assets/vendor/bower/bootstrap-sass-official/vendor/assets/javascripts/bootstrap.js',
            // 'lib/assets/vendor/bower/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/tooltip.js',
            // 'lib/assets/vendor/bower/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/*.js',
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
          'parse/public/assets/models.js': ['lib/models/*.js']
        }
      }
    },

    jsbeautifier: {
      files: [
        '*.js',
        'config/**/*.js',
        'lib/*.js',
        'lib/assets/js/**/*.js',
        'lib/helpers/**/*.js',
        'lib/models/js/**/*.js',
        'spec/**/*.js'
      ],
      options: {
        js: {
          indentSize: 2,
          jslintHappy: true,
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
          'lib/assets/js/**/*.js',
          'lib/helpers/**/*.js',
          'lib/models/**/*.js'
        ],
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
            'describe', 'it', 'browser', 'expect', 'beforeEach', 'spyOn', 'xit', 'jasmine', // karma and jasmine
            'inject', 'angular', // angular
            'element', 'by' // webdriver
          ]
        },

        src: [
          'spec/**/*.js',
        ],
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
      unit: {
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

  grunt.registerTask('jslint:all', ['jslint:production', 'jslint:test']);
  grunt.registerTask('build', ['exec:clean', 'bower:install', 'jsbeautifier', 'jslint:all', 'sass', 'htmlmin', 'uglify', 'copy:fonts']);
  grunt.registerTask('default', ['build']);

  grunt.registerTask('test_unit', ['tests_environment', 'build', 'karma:unit']);
  grunt.registerTask('test_functional', ['tests_environment', 'build', 'protractor:test']);

  grunt.registerTask('tests_environment', 'Set tests environment', setTestsEnvironment);
  grunt.registerTask('staging_environment', 'Set staging environment', setStagingEnvironment);

  grunt.registerTask('deploy_to_development', ['build', 'exec:deploy', 'exec:announce']);
  grunt.registerTask('deploy_to_staging', ['staging_environment', 'build', 'exec:deploy', 'exec:announce']);
  grunt.registerTask('deploy_to_tests', ['tests_environment', 'build', 'exec:deploy', 'exec:announce']);

  grunt.registerTask('ci', ['tests_environment', 'build', 'test_unit', 'exec:deploy', 'exec:announce', 'test_functional']);

  grunt.registerTask('test', ['build', 'test_unit']);

  function setStagingEnvironment() {
    grunt.config.set('env', 'staging');
  }

  function setTestsEnvironment() {
    grunt.config.set('env', 'tests');
  }
};
