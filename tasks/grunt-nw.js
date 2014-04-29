var grunt = require('grunt');

grunt.registerTask('nw', 'build node-webkit application', function() {
    var child = require('child_process');
    
    var config  = grunt.config('nw'),
        cmd     = config.nw_path,
        exec    = config.executable,
        sources = config.sources,
        dest    = config.dest,
        done    = this.async();
    
    // execute build

    // case linux
    if ( /linux/i.test(process.plaform) ) {
        // copy nw.pak
        sources.unshift(dest);
        child.exec('zip -rq ' + sources.join(' '), function(err, stdout, stderr) {
            var dir = "";
            
            if ( err ) {
                return grunt.log.errorlns(err);
            } else if ( stderr ) {
                return grunt.log.errorlns(stderr);
            }
            
            grunt.log.writeln(dest + ' application build success.');
            
            if ( exec ) {
                if ( dest.indexOf('/') !== -1 ) {
                    dir = dest.split('/');
                    dir.pop();
                    dir = dir.join('/') + '/';
                }
                grunt.file.copy(cmd + '/nw.pak', dir + 'nw.pak');
                child.exec('cat ' + cmd + '/nw ' + dest + ' > ' + dir + 'app && chmod +x ' + dir + 'app', function(err, stdout, stderr) {
                    if ( err ) {
                        return grunt.log.errorlns(err);
                    } else if ( stderr ) {
                        return grunt.log.errorlns(stderr);
                    }
                    grunt.log.oklns('App build success');
                    done();
                });
            } else {
                done();
            }
        });
    }
    // case Mac OS
    else if ( /darwin/i.test(process.platform) ) {
        // Application directory exists
        if ( ! grunt.file.exists(cmd + '/Contents/Resources/app.nw') ) {
            grunt.file.mkdir(cmd + '/Contents/Resources/app.nw');
        }

        // In Mac OS, simply copy files
        child.exec('cp -R ' + sources.join(' ') + ' ' +  cmd + '/Contents/Resources/app.nw', function(err, stdout, stderr) {
            if ( err ) {
                return grunt.log.errorlns(err);
            } else if ( stderr ) {
                return grunt.log.errorlns(stderr);
            }
            
            grunt.log.writeln('Application build success. installed at: ' + cmd + 'Contents/Resources/app.nw');
        });
    }
});
