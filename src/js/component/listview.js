var ListView = Guirunt.View.extend({
    _construct: function(list, options) {
        this.list       = list;
        this.listParent = null;

        Module.util.mixin(this, options || {});

        this.createList();
        if ( this.filters ) {
            this.filterView = new ListFilter(this.listParent.childNodes);
        }
    },

    createList: function() {
        var doc  = document,
            wrap = doc.createDocumentFragment(),
            ul   = doc.createElement('ul'),
            li;
        
        ul.className = 'guirunt-listview';
        this.list.forEach(function(data) {
            li = doc.createElement('li');
            li.appendChild(doc.createTextNode(data));

            if ( typeof this.onGenerate === 'function' ) {
                this.onGenerate(li);
            }
            
            wrap.appendChild(li);
        }.bind(this));

        ul.appendChild(wrap);
        ul.addEventListener('click', this, false);
        this.listParent = ul;
    },

    handleEvent: function(evt) {
        var element = evt.target;

        while ( element !== this.listParent &&  ! element.webkitMatchesSelector('ul.guirunt-listview > li') ) {
            element = element.parentNode;
        }

        this.onClick && this.onClick(evt);
    },

    /** @override **/
    appendTo: function(node) {
        if ( this.filters ) {
            this.filterView.appendTo(node);
        }
        node.appendChild(this.listParent);
    },

    destroy: function() {
        if ( this.filters ) {
            this.filterView.destroy();
        }
        this.listParent.removeventListner('click', this);
        this.listParent.parentNote.removeChild(this.listParent);
    }
});
