//= require ../lib/dragdrop.js

var ProjectModel = Guirunt.Model.extend({
    _construct: function() {
        this.ddHandle = new DragDrop(this.addProject.bind(this));
    },

    addProject: function(file) {
        var filePath = file.path;

        if ( ! grunt.file.isDir(filePath) ) {
            return Module.modal.dialogalert('ドロップされたファイルはディレクトリではありません。');
        }

        this.checkGruntFile(filePath);
    },

    addProjectFromFileSelect: function(file) {
        var relPath   = file.webkitRelativePath,
            basePath  = file.path.slice(0, file.path.indexOf(relPath)),
            directory = relPath.slice(0, relPath.indexOf('/'));

        this.addProject({path: basePath + directory});
    },

    handleEvent: function(evt) {
        
        switch ( evt.type ) {
            case 'change': // add project
                this.addProjectFromFileSelect(evt.target.files[0]);
                break;
        }
    },

    checkGruntFile: function(filePath) {
        // Gruntfile.js already exists?
        if ( grunt.file.exists(filePath + '/Gruntfile.js') ) {
            Module.modal.confirm('すでにGruntfile.jsが存在します。¥n設定をインポートしますか？')
                  .success(function() {
                      Guirunt.importConfig(require(filePath + '/Gruntfile.js'));
                      this.checkPackageJSON(filePath);
                  }.bind(this))
                  .failed(function() {
                      this.checkPackageJSON(filePath);
                  }.bind(this));
        } else {
            this.checkPackageJSON(filePath);
        }
    },

    checkPackageJSON: function(filePath) {
        // package.json exits?
        if ( grunt.file.exists(filePath + '/package.json') ) {
            Module.modal.dialog('package.jsonが見つかりました。¥n依存パッケージをインストールします。')
                  .success(function() {
                        var cmd = new Module.console();

                        cmd.exec('npm install --prefix=' + filePath)
                             .success(function() {
                                this.createProject(filePath);
                             }.bind(this));
                  }.bind(this));
        } else {
            Module.log('TODO: implement intialize package.json');
            this.createProject(filePath);
        }
    },
    
    createProject: function(projectPath) {
        var projectName = require('path').basename(projectPath);
        
        // Save storage
        Module.db.query('INSERT INTO projects (project_path, project_name) VALUES (?, ?)', [projectPath, projectName])
        .success(function() {
            this.trigger('addProject', projectName);
            Module.modal.dialog('Successfully added project.');
        }.bind(this))
        .failed(function(err) {
            console.log(err.message);
        });
    },
    
    changeProject: function(element) {
        this.currentProject = element;
        this.trigger('changeProject', element.getAttribute('data-projectname'));
    },

    getCurrentProject: function() {
        return this.currentProject;                   
    },
    
    loadProjects: function() {
        var that = this;
        
        // Get saved projects
        Module.db.query('SELECT * FROM projects;')
        .success(function(projects) {
            console.log(projects);
            projects.forEach(function(project) {
                that.trigger('addProject', project.project_name);
            });
        });
    }

});

var projectModel = new ProjectModel();
