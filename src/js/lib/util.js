(function(module) {

module.util = {};

module.util.addClass = function(element, klass) {
    element.classList.add(klass);
};

module.util.removeClass = function(element, klass) {
    element.classList.remove(klass);
};

module.util.hasClass = function(element, klass) {
    return element.classList.contains(klass);
};

module.util.toggleClass = function(element, klass) {
    element.classList.toggle(klass);
};

module.util.isObject = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
};

module.util.escape = function(str) {
    return str.toString()
              .replace('<', '&lt;')
              .replace('>', '&gt;')
              .replace('"', '&quot;');
};

module.util.mixin = function(base, over) {
    Object.keys(over).forEach(function(key) {
        base[key] = over[key];
    });

    return base;
};

})(typeof Module !== 'undefined' ? Module : this);
