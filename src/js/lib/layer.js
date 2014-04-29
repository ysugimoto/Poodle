(function(module) {

var stackLayer;

function Layer() {
   if ( stackLayer ) {
       return stackLayer;
   }

   this.layer = null;
   this.createLayer();
   stackLayer = this;
}

Layer.prototype.show = function() {
    this.layer.style.display = 'block';
};

Layer.prototype.hide = function() {
    this.layer.style.display = 'none';
};

Layer.prototype.createLayer = function() {
    this.layer = document.createElement('div');
    this.layer.setAttribute('id', 'guirunt-layer');
    
    document.body.appendChild(this.layer);
};

Layer.prototype.addEventListener = function(type, callback, bubble) {
    this.layer.addEventListener(type, callback, !!bubble);
};

Layer.prototype.removeEventListener = function(type, callback) {
    this.layer.removeEventListener(type, callback);
};

module.Layer = Layer;

})(typeof Module !== 'undefined' ? Module : this);
