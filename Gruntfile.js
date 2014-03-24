module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      build: {
        files : {
          'js/ParticleEmitter.min.js' : 'js/ParticleEmitter.js',
          'js/Particle.min.js' : 'js/Particle.js',
        }
      },

    },
    watch: {
      scripts: {
        files: ['*.js'],
        tasks: ['uglify'],
        options: {
          spawn: false,
        },
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['uglify']);

};
