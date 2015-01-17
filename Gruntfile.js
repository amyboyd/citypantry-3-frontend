'use strict';

module.exports = function (grunt) {
    // Dynamically load npm tasks.
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/web/images/*'],
                        dest: 'web/dist/images',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/web/images/team/*'],
                        dest: 'web/dist/images/team',
                        filter: 'isFile'
                    }
                ]
            }
        },

        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.',
                    src: 'web/dist/images/**/*.{png,jpg,gif}',
                    dest: '.'
                }]
            }
        },

        sass: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/web/scss',
                    src: ['main.scss'],
                    dest: 'web/dist/css',
                    ext: '.css'
                }]
            }
        },

        csso: {
            dist: {
                files: {
                    'web/dist/css/main.min.css': 'web/dist/css/main.css',
                }
            }
        },

        concat: {
            dist: {
                options: {
                    // Replace all 'use strict' statements in the code with a single one at the top
                    banner: "'use strict';\n",
                    process: function(src, filepath) {
                        return '// Source: ' + filepath + '\n' +
                            src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
                    },
                },
                files: {
                    'web/dist/js/built.js': [
                        'src/web/js/lib/angular.min.js',
                        'src/web/js/lib/angular-cookies.min.js',
                        'src/web/js/main.js',
                        'src/web/js/controllers/**/*.js',
                    ],
                },
            },
        },

        watch: {
            options: {
                livereload: true,
            },
            css: {
                files: ['src/web/**/*.scss'],
                tasks: ['sass', 'csso'],
                options: {
                    debounceDelay: 100,
                },
            },
            js: {
                files: ['src/web/**/*.js'],
                tasks: ['concat'],
                options: {
                    debounceDelay: 100,
                },
            }
        }
    });

    /**
     * Task to build assets for distribution then watch for changes.
     */
    grunt.registerTask('default', [
        'dist',
        'watch',
    ]);

    /**
     * Task to build assets for distribution.
     */
    grunt.registerTask('dist', [
        'copy:dist',
        'imagemin:dist',
        'sass:dist',
        'csso:dist',
        'concat:dist',
    ]);
};