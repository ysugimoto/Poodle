module.exports = function(grunt) {

  grunt.initConfig({
    
    sprockets: {
        files: ["src/js/main.js"],
        dest: "assets/js/application.js"
    },

    less: {
        dev: {
            files: {
                "assets/css/style.css": ["src/less/style.less"]
            }
        }
    },

    uglify: {
      target: {
        files: {
          'assets/js/applcation.min.js': ['assets/js/application.js']
        }
      }
    },
    
    // node-webkit
    nw: {
      nw_path: '/Applications/node-webkit.app',
      executable: true,
      sources: ['bundles', 'node_modules', 'index.html', 'package.json', 'assets']
    },

  });
  
  grunt.loadNpmTasks('grunt-sprockets');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadTasks('tasks');
  
  grunt.registerTask('default', ['sprockets', 'less:dev', 'uglify', 'nw']);
};
