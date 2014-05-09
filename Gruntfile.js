module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    env: 'development',

    sites: {
      'development': 'https://dev.deliberare.com.br',
      'production': 'https://deliberare.com.br',
      'tests': 'https://tests.deliberare.com.br'
    },

    apps: {
      'development': 'agora_development',
      'production': 'agora',
      'tests': 'agora_tests'
    },

    concat: {
      config: {
        files: {
          'public/assets/config.js': ['lib/assets/js/config/<%= env %>.js']
        }
      },
      html: {
        files: {
          'public/index.html': ['lib/html/index.html']
        },
      },
      css: {
        options: {
          separator: ';',
        },
        files: {
          'public/assets/vendor.css': ['lib/assets/vendor/css/**/*.css'],
          'public/assets/lib.css': ['lib/assets/css/**/*.css']
        }
      }
    },

    watch: {
      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['concat'],
        options: {
          nospawn: true
        }
      },
      html: {
        files: ['lib/html/**/*.html'],
        tasks: ['concat:html'],
        options: {
          nospawn: true
        }
      },
      styles: {
        files: ['lib/assets/css/**/*.css'],
        tasks: ['concat:css'],
        options: {
          nospawn: true
        }
      },
      lib_javascripts: {
        files: ['lib/assets/js/**/*.js'],
        tasks: ['uglify:lib_javascripts'],
        options: {
          nospawn: true
        }
      },
      vendor_javascripts: {
        files: ['lib/assets/vendor/**/*.js'],
        tasks: ['uglify:vendor_javascripts'],
        options: {
          nospawn: true
        }
      },
      html: {
        files: ['lib/html/**/*.html'],
        tasks: ['concat:dist'],
        options: {
          nospawn: true
        }
      }
    },

    uglify: {
      options: {
        mangle: false
      },

      vendor_javascripts: {
        files: {
          'public/assets/vendor.js': ['lib/assets/vendor/js/foundation/vendor/jquery.js', 'lib/assets/vendor/**/*.js'],
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
        configFile: "node_modules/grunt-protractor-runner/node_modules/protractor/referenceConf.js",
        keepAlive: true,
        noColor: false,
        chromeDriver: '/opt/google/chrome',
        args: {
          params: ['no-sandbox']
        }
      },
      test: {
        options: {
          configFile: "e2e.conf.js",
        }
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true,
        browsers: ['ChromeNoSandbox']
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

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-exec');


  grunt.registerTask('default', ['concat']);

  grunt.registerTask('test_unit', ['tests_environment', 'default', 'karma:unit']);
  grunt.registerTask('test_functional', ['tests_environment', 'default', 'protractor:test']);

  grunt.registerTask('tests_environment', 'Set tests environment', setTestsEnvironment);
  grunt.registerTask('production_environment', 'Set production environment', setProductionEnvironment);

  grunt.registerTask('deploy_to_development', ['default', 'exec:deploy', 'exec:announce']);
  grunt.registerTask('deploy_to_production', ['production_environment', 'default', 'uglify', 'exec:deploy', 'exec:announce']);
  grunt.registerTask('deploy_to_tests', ['tests_environment', 'default', 'exec:deploy', 'exec:announce']);


  function setProductionEnvironment() {
    grunt.config.set('env', 'production');
  }

  function setTestsEnvironment() {
    grunt.config.set('env', 'tests');
  }
};
