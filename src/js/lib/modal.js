(function(module) {
    
function Modal() {
    this.layer      = new Module.Layer();
    this.element    = this.initModal();
    this.message    = this.element.querySelector('h3');
    this.ok         = this.element.getElementsByTagName('button')[0];
    this.cancel     = this.element.getElementsByTagName('button')[1];
    this.lazy       = null;
    this.blinkTimer = null;

    this.ok.addEventListener('click',     this, false);
    this.cancel.addEventListener('click', this, false);
    this.layer.addEventListener('click',  this, false);
}

Modal.prototype.initModal = function() {
    var doc     = document,
        element = doc.getElementById('modal'),
        html;

    if ( ! element ) {
        element = doc.createElement('div');
        element.setAttribute('id', 'modal');
        html  = '<h3 class="message"></h3>';
        html += '<div class="buttons">';
        html +=   '<button class="ok widget-button"><span class="icon icon-ok"></span>OK</button>',
        html +=   '<button class="cancel widget-button"><span class="icon icon-cancel"></span>Cancel</button>';
        html += '</div>';
        element.innerHTML = html;
        doc.body.appendChild(element);

        Module.log('Modal element crated.');
    }

    element.style.display = 'none';

    return element;
};

Modal.prototype.dialog = function(message) {
    this.message.innerHTML    = Module.util.escape(message).replace('¥n', '<br>');
    this.cancel.style.display = 'none';

    this.element.style.display = 'block';
    this.layer.show();
    this.lazy = new Module.Lazy();

    return this.lazy.promise();

};

Modal.prototype.confirm = function(message) {
    this.message.innerHTML    = Module.util.escape(message).replace('¥n', '<br>');
    this.cancel.style.display = 'inline-block';

    this.element.style.display = 'block';
    this.layer.hide();
    this.lazy = new Module.Lazy();

    return this.lazy.promise();
};

Modal.prototype.handleEvent = function(evt) {
    if ( ! this.lazy ) {
        return;
    }

    if ( Module.util.hasClass(evt.currentTarget, 'ok') ) {
        Module.log('OK button clikced');
        this.lazy.success();
        this.element.style.display = 'none';
        this.layer.hide();
        this.lazy = null;
    } else if ( Module.util.hasClass(evt.currentTarget, 'cancel') ) {
        Module.log('Cancel button clikced');
        this.element.style.display = 'none';
        this.layer.hide();
        this.lazy.failed();
        this.lazy = null;
    } else if ( evt.currentTarget.id === 'modalLayer' && ! this.blinkTimer ) {
        Module.log('Layer clikced');
        Module.util.addClass(this.element, 'notify');
        this.blinkTimer = setTimeout(function() {
            Module.util.removeClass(this.element, 'notify');
            this.blinkTimer = null;
        }.bind(this), 400);
    }
};

module.modal = new Modal();

})(typeof Module !== 'undefined' ? Module: this);
