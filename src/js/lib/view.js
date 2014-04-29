(function(module) {

var EventEmitter = require('events').EventEmitter;
var util         = require('util');

function View(element, options) {
    if ( Module.util.isObject(element) ) {
        Object.keys(element).forEach(function(key) {
            this[key] = element[key];
        }.bind(this));
    } else {
      this.element = element;
      if ( Module.util.isObject(options) ) {
          Object.keys(options).forEach(function(key) {
              this[key] = options[key];
          }.bind(this));
      }
    }

    EventEmitter.call(this);
    this._chainView = [];
}

View.make = function(expr, options) {
    var element;

    if ( expr instanceof Element ) {
        element = expr;
    } else {
        element = ( this.element || document ).querySelector(expr);
    }

    return new this.prototype.constructor(element, options);
};

View.extend = function(options) {
    var methods    = options || {};
    var parentView = (typeof this === 'function') ? this : this.constructor;
    var ExtendView = function() {
        if ( typeof parentView.prototype._construct === 'function' ) {
            parentView.prototype._construct.apply(this, arguments);
        }

        this._construct && this._construct.apply(this, arguments);
    };
    var appendTo, destroy;
    
    util.inherits(ExtendView, this);
    Object.keys(methods).forEach(function(key) {
        ExtendView.prototype[key] = methods[key];
    });

    ExtendView.make   = this.make;
    ExtendView.extend = this.extend;
    destroy = ExtendView.prototype.destroy;
    ExtendView.prototype.destroy = function() {
        if ( typeof parentView.prototype.destroy === 'function' ) {
            parentView.prototype.destory.call();
        }
        
        if ( typeof destroy === 'function' ) {
            destroy.call(this);
        }

        this._chainView.forEach(function(view) {
            view.destroy();
        });

    };
    appendTo = ExtendView.prototype.appendTo;
    ExtendView.prototype.appendTo = function(node) {
        if ( node instanceof View ) {
            node._chainView.push(this);
            node = node.element;
        }

        if ( typeof appendTo === 'function' ) {
            appendTo.call(this, node);
        }
    };
    
    return ExtendView;
};

util.inherits(View, EventEmitter);

View.prototype.listenTo = function(model, event, callback) {
    var handler;

    switch (typeof callback) {
        case 'string':
            handler = ( typeof this[callback] === 'function' )
                        ? this[callback].bind(this)
                        : null;
            break;
        case 'function':
            handler = callback.bind(this);
            break;
        default:
            handler = ( this.handleEvent )
                        ? this.handleEvent.bind(this)
                        : null;
            break;
    }

    if ( model instanceof module.Model ) {
         model.listen(event, handler);
         this[model.constructor.name] = model;
    }
};

View.prototype.unlistenTo = function(model, event) {
    if ( model instanceof module.Model ) {
         model.unlistenTo(this, event);
    }
};

View.prototype.find = function(expr) {
    return this.element.querySelector(expr);
};

View.prototype.findAll = function(expr) {
    return this.element.querySelectorAll(expr);
};

View.prototype.appendTo = function(node) {
    node.appendChild(this.element);
};

View.prototype.destroy = function() {
    // do something
    // remove events, GC and so on...
};

module.View = View;

})(typeof Module !== 'undefined' ? Module : this);
