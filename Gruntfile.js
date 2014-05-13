module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    isRunningOnSnap: process.env.SNAP_CI,

    env: 'development',

    sites: {
      'development': 'https://dev.deliberare.com.br',
      'tests':       'https://tests.deliberare.com.br',
      'staging':     'https://staging.deliberare.com.br'
    },

    apps: {
      'development': 'agora_development',
      'tests':       'agora_tests',
      'staging':     'agora_staging'
    },

    bower: {
      install: {
        options: {}
      }
    },

    concat: {
      html: {
        files: {
          'public/index.html': ['lib/html/index.html']
        },
      },
      js: {
        options: {
          separator: '\n;'
        },
        files: {
          'public/assets/config.js': ['lib/assets/js/config/<%= env %>.js'],
          'public/assets/vendor.js': [
            'lib/assets/vendor/js/foundation/vendor/jquery.js',
            'lib/assets/vendor/js/foundation/foundation/foundation.js',
            'lib/assets/vendor/js/foundation/**/*.js',
            'lib/assets/vendor/js/**/*.js'
          ],
          'public/assets/lib.js': [
            'lib/assets/js/app/**/*.js',
            'lib/assets/js/initializers/*.js'
          ]
        }
      }
    },

    sass: {
      options: {
        includePaths: ['lib/assets/vendor/bower/bootstrap-sass-official/vendor/assets/stylesheets/bootstrap']
      },
      dist: {
        files: {
          'public/assets/vendor.css': ['lib/assets/vendor/bower/bootstrap-sass-official/vendor/assets/stylesheets/bootstrap/bootstrap.scss'],
          'public/assets/app.css': ['lib/assets/css/**/*.scss', 'lib/assets/css/**/*.sass']
        }
      }
    },

    watch: {
      options: {
        spawn: false
      },
      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['concat']
      },
      html: {
        files: ['lib/html/**/*.html'],
        tasks: ['concat:html']
      },
      styles: {
        files: ['lib/assets/css/**/*.css'],
        tasks: ['concat:css']
      },
      lib_javascripts: {
        files: ['lib/assets/js/**/*.js'],
        tasks: ['uglify:lib_javascripts']
      },
      vendor_javascripts: {
        files: ['lib/assets/vendor/**/*.js'],
        tasks: ['uglify:vendor_javascripts']
      },
      html: {
        files: ['lib/html/**/*.html'],
        tasks: ['concat:dist']
      }
    },

    uglify: {
      options: {
        mangle: false
      },

      vendor_javascripts: {
        files: {
          'public/assets/vendor.js': [
            'lib/assets/vendor/**/*.js'
          ],
        }
      },

      lib_javascripts: {
        files: {
          'public/assets/lib.js': ['lib/assets/js/**/*.js']
        }
      }
    },

    protractor: {
      options: {
        keepAlive: true,
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
      deploy: {
        command: "parse deploy <%= apps[env] %>"
      },
      announce: {
        command: function() {
          var env     = this.config.get('env'),
              sites   = this.config.get('sites'),
              msg     = "New version deployed to <" + sites[env] + "|the " + env + " environment> by `git config user.name`.",
              payload = JSON.stringify('{"channel": "#general", "icon_emoji": ":monkey_face:", "username": "deploy", "text": "' + msg + '"}');

          return 'curl -s -X POST --data-urlencode payload=' + payload + ' https://deliberare.slack.com/services/hooks/incoming-webhook?token=00AslaqafRD6hlO2YcGEpm4v'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('build', ['bower:install', 'sass', 'concat']);
  grunt.registerTask('default', ['build']);

  grunt.registerTask('test_unit', ['tests_environment', 'build', 'karma:unit']);
  grunt.registerTask('test_functional', ['tests_environment', 'build', 'protractor:test']);

  grunt.registerTask('tests_environment', 'Set tests environment', setTestsEnvironment);
  grunt.registerTask('staging_environment', 'Set staging environment', setStagingEnvironment);

  grunt.registerTask('deploy_to_development', ['build', 'exec:deploy', 'exec:announce']);
  grunt.registerTask('deploy_to_staging', ['staging_environment', 'build', 'uglify', 'exec:deploy', 'exec:announce']);
  grunt.registerTask('deploy_to_tests', ['tests_environment', 'build', 'exec:deploy', 'exec:announce']);

  grunt.registerTask('ci', ['tests_environment', 'build', 'test_unit', 'exec:deploy', 'exec:announce', 'tests_environment']);

  function setStagingEnvironment() {
    grunt.config.set('env', 'staging');
  }

  function setTestsEnvironment() {
    grunt.config.set('env', 'tests');
  }
};
