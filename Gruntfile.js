module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  var customLaunchers = {},
      execSync = require('child_process').execSync;

  if (grunt.cli.tasks.length == 1 && grunt.cli.tasks[0] == 'karma:browserstack') {
    customLaunchers = {
      bs_Chrome_39: {
        base: 'BrowserStack',
        browser: 'chrome',
        browser_version: '39',
        os: 'Windows',
        os_version: '7'
      }
    };

    if  (!process.env.BROWSER_STACK_USERNAME || !process.env.BROWSER_STACK_ACCESS_KEY) {
      if (!require('fs').existsSync('browserstack.json')) {
        console.log('Please create a browserstack.json with your credentials.');
        process.exit(1);
      } else {
        process.env.BROWSER_STACK_USERNAME = require('./browserstack').username;
        process.env.BROWSER_STACK_ACCESS_KEY = require('./browserstack').accessKey;
      }
    }
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: [
      'dist/*.js'
    ],

    copy: {
      es6: {
        src: 'lib/lost.js',
        dest: 'dist/es6/lost.js'
      },
      globals: {
        src: 'lib/lost.js',
        dest: 'dist/globals/lost.js',
        options: {
          process: function(content) {
            return content.replace(/^\s*export\s*default\s+([A-Za-z_]+);?/m, function(match, variable) {
              return '\n' +
                'if (window.'  + variable + ' === undefined) {\n' +
                '  window.' + variable + ' = ' + variable + ';\n' +
                '}';
            });
          }
        }
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> \n Author: <%= pkg.author %> \n License: <%= pkg.license %>  */\n'
      },
      dist: {
        files: {
          'dist/amd/lost.min.js':     ['dist/amd/lost.js'],
          'dist/globals/lost.min.js': ['dist/globals/lost.js']
        }
      }
    },

    watch: {
      scripts: {
        files: ['lib/lost.js', 'test/integration.js'],
        tasks: ['copy:globals', 'karma:local']
      }
    },

    karma: {
      options: {
        basePath: '',
        frameworks: ['jasmine'],
        files: [
          'dist/globals/lost.js',
          'test/**/*.js'
        ],
        plugins: [
          'karma-jasmine',
          'karma-phantomjs-launcher',
          'karma-coverage',
          'karma-browserstack-launcher'
        ],
        preprocessors: {
          'lib/lost.js': ['coverage']
        },
        colors: true
      },

      browserstack: {
        browserStack: {
          retryLimit: 2,
          project: 'Lost.js tests',
          build: execSync('git rev-parse HEAD', { encoding: 'utf-8' })
        },
        singleRun: true,
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers),
        reporters: ['dots']
      },

      local: {
        singleRun: true,
        browsers: ['PhantomJS'],
        reporters: ['dots', 'coverage']
      }
    },

  });

  grunt.registerTask('default', ['clean', 'copy', 'uglify']);

  grunt.registerTask('test', ['clean', 'copy', 'karma:local']);
  grunt.registerTask('test:continuous', ['clean', 'copy', 'karma:browserstack']);
};
