// Application logic
Guirunt.boot = function() {
    // Initialized check
    if ( ! Module.storage.exists('Guirunt_initialized') ) {
        // Initialize application
        console.log('Application is not initialized.');
        // Create database
        Module.db._initDB();
        Module.storage.set('Guirunt_initialized', 1);
    }
    
    //Module.ui.init();
};

Guirunt.initProject = function(projectPath) {
    if ( ! grunt.file.isDir(projectPath) ) {
        return Module.window.alert('ディレクトリではありません');
    }

    // Save storage
    Module.db.query('INSERT INTO projects VALUES (?)', [projectPath])
    .success(function() {
        Module.window.alert('Successfully added project.');
    })
    .failed(function(err) {
        console.log(err.message);
    });
};

Guirunt.currentView = null;
Guirunt.boot();