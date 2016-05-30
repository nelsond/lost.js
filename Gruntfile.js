module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  var customLaunchers = {},
      execSync = require('child_process').execSync;

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
          'karma-coverage'
        ],
        preprocessors: {
          'lib/lost.js': ['coverage']
        },
        colors: true
      },

      local: {
        singleRun: true,
        browsers: ['PhantomJS'],
        reporters: ['dots', 'coverage']
      }
    },

  });

  grunt.registerTask('default', ['clean', 'copy', 'uglify']);
  grunt.registerTask('test', ['clean', 'copy', 'karma']);
};
