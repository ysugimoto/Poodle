(function(module) {

var EventEmitter = require('events').EventEmitter;
var util         = require('util');

module.Model = Model;

function Model(methods) {
    if ( Guirunt.util.isObject(methods) ) {
        Object.keys(methods).forEach(function(key) {
          this[key] = methods[key];
        }.bind(this));
    }

    EventEmitter.call(this);
    this._listenViews = {};
}

util.inherits(Model, EventEmitter);

Model.extend = function(options) {
    var methods    = options || {};
    var parentModel = (typeof this === 'function') ? this : this.constructor;
    var ExtendModel = function() {
        parentModel.apply(this, arguments);
        if ( typeof parentModel.prototype._construct === 'function' ) {
            parentModel.prototype._construct.call(this);
        }

        this._construct && this._construct();
    };
    
    util.inherits(ExtendModel, this);
    Object.keys(methods).forEach(function(key) {
        ExtendModel.prototype[key] = methods[key];
    });

    ExtendModel.extend = this.extend;
    
    return ExtendModel;
};

Model.prototype.listen = function(event, handler) {
    if ( ! (event in this._listenViews) ) {
      this._listenViews[event] = [];
    }

    this._listenViews[event].push(handler);
};

Model.prototype.trigger = function(event, data) {
    if ( event in this._listenViews ) {
        this._listenViews[event].forEach(function(handler) {
            handler && handler({data: data});
        });
    }
};

Model.prototype.set = function(name, data) {
    this[name] = data;
};

Model.prototype.get = function(name) {
    return this[name] || null;
};


})(typeof Module !== 'undefined' ? Module : this);
