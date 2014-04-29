(function(module) {
    
    var DB = openDatabase('guirunt', '1.0', 'guirunt data storage', 2 * 1024 * 1024);
    
    function Database() {}
    
    Database._initDB = function() {
        DB.transaction(function(trans) {
            trans.executeSql("CREATE TABLE IF NOT EXISTS projects (project_path TEXT, project_name TEXT);", [],
                function(trans, result) { console.log('Create project table success'); },
                function(trans, err) { console.log("Failed to create table: " + err.message); }
            );

            trans.executeSql("CREATE TABLE IF NOT EXISTS project_tasks (project_name TEXT, task_name TEXT)", [],
                function(trans, result) { console.log('Create project_tasks table success'); },
                function(trans, err) { console.log("Failed to create table: " + err.message); }
            );
            
            trans.executeSql("CREATE TABLE IF NOT EXISTS task_settings (task_name TEXT, setting_data TEXT)", [],
                function(trans, result) { console.log('Create task_settings table success'); },
                function(trans, err) { console.log("Failed to create table: " + err.message); }
            );
        });
    };

    Database.query = function(sql, _bind) {
        var lazy = new module.Lazy(),
            bind = _bind || [];
        
        DB.transaction(function(trans) {
            transaction = trans;
            trans.executeSql(sql, bind, 
                function(trans, result) {
                    var ret = [],
                        i   = 0;
                    
                    if ( /^insert/i.test(sql) ) {
                        lazy.signal.success(result.insertId);
                    } else if ( /^(update|delete)/i.test(sql) ) {
                        lazy.signal.success(result.rowAffected);
                    } else {
                        for ( ; i < result.rows.length; ++i ) {
                            ret[i] = result.rows.item(i);
                        }
                        lazy.signal.success(ret);
                    }
                },
                function (trans, error) {
                    lazy.signal.failed(error);
                }
            );
        });
        
        return lazy;
    };
    
    module.db = Database;
    
})(typeof Module !== 'undefined' ? Module : this);
