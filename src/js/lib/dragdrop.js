function DragDrop(callback) {
    this.callback = callback;

    this.layer = new Module.Layer();
    this.setUp();
}

DragDrop.prototype.setUp = function() {
    var doc = document;

    doc.addEventListener('dragenter', this, false);
    doc.addEventListener('dragover',  this, false);
    doc.addEventListener('dragleave', this, false);
                        
    // Drop element event handle
    this.layer.addEventListener('dragenter', this.cancelEvent, false);
    this.layer.addEventListener('dragover',  this.cancelEvent, false);
    this.layer.addEventListener('dragleave', this,        false);
    this.layer.addEventListener('drop',      this,        false);

    Module.log('D&D Event setup completed.');
};

DragDrop.prototype.cancelEvent = function(evt) {
    evt.preventDefault();
    evt.stopPropagation();
};

DragDrop.prototype.handleEvent = function(evt) {
    switch ( evt.type ) {
        case 'dragenter':
        case 'dragover':
              this.dragInit(evt);
            break;
        case 'dragleave':
            this.dragEnd(evt);
            break;
        case 'drop':
            this.dropFile(evt);
            break;
        default :
            break;
    }
};

DragDrop.prototype.dragInit = function(evt) {
    this.layer.show();
};

DragDrop.prototype.dragEnd = function(evt) {
    evt.preventDefault();
    if ( evt.pageX < 1 || evt.pageY < 1 ) {
        this.layer.hide();
    }
};

DragDrop.prototype.dropFile = function(evt) {
    this.cancelEvent(evt);
    this.layer.hide();

    var files = evt.dataTransfer.files,
        i     = -1;

    while ( files[++i] ) {
        this.callback(files[i]);
    }
};
