var ListFilter = Guirunt.View.extend({
    _construct: function(nodeList) {
        this.targets  = [];            

        this.factory(nodeList);
        this.genComponent();
    },

    factory: function(nodeList) {
        var i    = -1,
            size = nodeList.length;
        
        while ( nodeList[++i] ) {
            this.targets.push([nodeList[i].textContent, nodeList[i]]);
        }
    },

    genComponent: function() {
        var doc      = document,
            section  = doc.createElement('section'),
            input    = doc.createElement('input');

        section.className = 'guirunt-listfilter';
        section.appendChild(input);

        input.type  = 'text';
        input.name  = 'q';
        input.value = '';
        input.addEventListener('keyup', this, false);

        this.input = input;
    },

    handleEvent: function(evt) {
        var value = evt.target.value,
            i     = -1,
            size  = this.targets.length,
            target;
        
        while ( this.targets[++i] ) {
            target = this.targets[i];
            if ( value === '' || target[0].indexOf(value) !== -1 ) {
                target[1].style.display = 'block';
            } else {
                target[1].style.display = 'none';
            }
        }
    },

    appendTo: function(node) {
        node.appendChild(this.input.parentNode);
        this.input.focus();
    },

    destroy: function() {
        this.input.removeEventListener('click', this);
        this.input.parentNode.parentNode.removeChild(this.input.parentNode);
    }


});
