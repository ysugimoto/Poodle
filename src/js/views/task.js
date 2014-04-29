var TaskView = View.extend({
    _construct: function() {
        this.head     = this.element.querySelector('h1');
        this.taskList = this.element.querySelector('.widget-task-list');
        this.addTask  = this.element.querySelector('button[data-role="addtask"]');
        this.delTask  = this.element.querySelector('button[data-role="deltask"]');
        
        this.initialize();
    },

    initialize: function() {
        this.listenTo(projectModel, 'changeProject', 'handleChangeProject');
        //this.taskList.addEventListener('click', this.handleTaskClicked.bind(this), false);
        this.addTask.addEventListener('click', this.handleAddTask.bind(this), false);
        //this.delTask.addEventListener('click', this.handleDelTask.bind(this), false);
    },
    
    handleChangeProject: function(evt) {
        this.head.innerHTML = '<span class="project-name">' + evt.data + '</span> のタスク';
        // Get task list
        Module.db.query('SELECT task_name FROM project_tasks WHERE project_name = ?', [evt.data])
            .success(function(taskList) {
                this.createTaskList(taskList);
            }.bind(this))
            .failed(function() {
                this.createTaskList([]);
            }.bind(this));
    },

    handleAddTask: function(evt) {
        var modal   = new Module.SelectableList(['hoge', 'huga', 'piyo']),
            project = projectModel.getCurrentProject();

        if ( ! project ) {
            return modal.destroy();
        }

        console.log(modal);
        modal.show();

        
    },

    createTaskList: function(taskList) {
        var node  = this.taskList,
            doc   = document,
            label,
            span,
            input;

        while ( node.firstChild ) {
            node.removeChild(node.firstChild);
        }
        
        taskList.forEach(function(task) {
            label = doc.createElement('label');
            span  = doc.createElement('span');
            input = doc.createElement('input');

            input.setAttribute('name', 'task');
            input.setAttribute('type', 'radio');
            span.className = 'label';
            span.appendChild(doc.createTextNode(task));

            label.appendChild(input);
            label.appendChild(span);
            label.setAttribute('data-taskname', task);

            node.appendChild(label);
        });
    }
});

var taskView = new TaskView(
    document.getElementById(View.buttons[1].value),
    { trigger: View.buttons[1] }
);
