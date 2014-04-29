(function(module) {

module.config = {

    // Debug mode
    debug: true,

    // Application root
    APPPATH: process.cwd() + '/', 

    // Bundled node path
    NODE_PATH: "./bundles/node/bin/node",

    // Bundled npm command path
    NPM_PATH: process.cwd() + "/bundles/node/bin/npm",

    // Drop area description
    DROP_DESCRIPTION: "Drop Project to add"
};

})(typeof Module !== 'undefined' ? Module : this);

