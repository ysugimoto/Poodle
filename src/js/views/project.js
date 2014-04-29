var ProjectView = View.extend({
    _construct: function() {
        this.projectList = this.element.querySelector('.widget-project-list');
        this.addProjectInput = this.element.querySelector('#add-project-btn');
        
        this.listenTo(this.model, 'addProject', function(evt) {
            this.createProjectNode(evt.data);
        }.bind(this));
        
        this.projectList.addEventListener('click', this.setProject.bind(this), false);
        this.model.loadProjects();
        this.initAddProjectEvent();
    },

    initAddProjectEvent: function() {
        var btn  = this.element.querySelector('button[data-role="addproject"]');

        this.addProjectInput.addEventListener('change', this.model, false);
        btn.addEventListener('click', this.selectFile.bind(this), false);
    },
    
    selectFile: function(evt) {
        var dispatcher = document.createEvent('MouseEvent');

        dispatcher.initEvent('click', false, false, false);
        this.addProjectInput.dispatchEvent(dispatcher);
    },

    setProject: function(evt) {
        var element = evt.target;
        
        if ( /INPUT|SPAN/.test(element.tagName) ) {
            element = element.parentNode;
        }
        this.model.set('currentProject', element);
    },
    
    createProjectNode: function(projectName) {
        var label = document.createElement('label'),
            input = document.createElement('input'),
            span  = document.createElement('span');
        
        input.type  = 'radio';
        input.name  = 'project';
        input.value = projectName;
        
        span.className = 'label';
        span.appendChild(document.createTextNode(projectName));
        
        label.appendChild(input);
        label.appendChild(span);
        
        label.setAttribute('data-projectname', projectName);
        
        this.projectList.appendChild(label);
        if ( this.projectList.childNodes.length === 1 ) {
            this.model.changeProject(label);
        }
    }
});

var projectView = new ProjectView(document.getElementById(View.buttons[0].value), {
    trigger: View.buttons[0],
    model: projectModel
});
