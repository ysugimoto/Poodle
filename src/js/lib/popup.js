(function(module) {

var util = require('util');
var EventEmitter = require('events').EventEmitter;

function PopupBase(width, height) {
    this.width  = width;
    this.height = height;
    this.box    = null;

    EventEmitter.call(this);
}

util.inherits(PopupBase, EventEmitter);

PopupBase.prototype.createBox = function() {
    this.box           = document.createElement('div');
    this.box.className = 'guirunt-popup';
    this.box.style.width  = ( typeof this.width === 'string')   ? this.width  : this.width  + 'px';
    this.box.style.height = ( typeof this.height === 'string' ) ? this.height : this.height + 'px';
    this.layer            = new Module.Layer();

    document.body.appendChild(this.box);
    this.layer.addEventListener('click', this, false);
};

PopupBase.prototype.handleEvent = function(evt) {
    this.layer.removeEventListener('click', this);
    this.hide();
};

PopupBase.prototype.show = function() {
    this.layer.show();
    this.box.style.display = 'block';
};

PopupBase.prototype.hide = function() {
    this.layer.hide();
    this.box.style.display = 'none';
};

PopupBase.prototype.destroy = function() {
    document.body.removeChild(this.box);
    this.box = null;
};

PopupBase.prototype.insertContents = function(html) {
    this.box.innerHTML = html;
};

function SelectableList(list, option) {
    this.options = Module.util.mixin({filters: true}, option || {});

    PopupBase.call(this);
    this.createBox();
    this.createView(list);
}

util.inherits(SelectableList, PopupBase);

SelectableList.prototype.createView = function(list) {
    this.listView = new ListView(list, { filters: true });
    this.listView.appendTo(this.box);
};

SelectableList.prototype.close = function() {
    this.listView.destroy();
    this.destory();
};

module.SelectableList = SelectableList;


})(typeof Module !== 'undefined' ? Module : this);
