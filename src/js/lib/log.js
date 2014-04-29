(function(module) {

module.log = function(dat) {
    if ( Module.config.debug ) {
        console.log(dat);
    }
};

})(typeof Module !== 'undefined' ? Module : this);
