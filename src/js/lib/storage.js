(function(module) {

function Storage() {
    this.storage = localStorage;
}

Storage.prototype = {
    constructor: Storage,
    set:         storage_set,
    get:         storage_get,
    remove:      storage_remove,
    exists:      storage_exists
};

function storage_set(key, value) {
    var storage = this.storage,
        param;
    
    if ( value !== void 0 ) {
      storage.setItem(key, value);
    }
    if ( Object.prototype.toString.call(key) === '[Object object]' ) {
        Object.keys(key).forEach(function(k) {
            storage.setItem(k, key[k]);
        });
    }
}

function storage_get(key) {
    var item = this.storage.getItem(key);

    return ( item === null ) ? item : null;
}

function storage_remove(key) {
    return this.storage.removeItem(key);
}

function storage_exists(key) {
    var item = this.storage.getItem(key);

    return ( item === null ) ? false : true;
}

module.storage = new Storage();


})(typeof Module !== 'undefined' ? Module : this);
