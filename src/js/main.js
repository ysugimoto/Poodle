(function(global) {

var Module, Guirunt, GUI;
var grunt = require('grunt');

Module = Guirunt = global.Guirunt = {};
GUI    = Guirunt.GUI = require('nw.gui');
Module.window = GUI.Window.get().window;

// include config
//= require config/config.js

// include libraries
//= require lib/lazy.js
//= require lib/log.js
//= require lib/env.js
//= require lib/util.js
//= require lib/console.js
//= require lib/storage.js
//= require lib/db.js
//= require lib/request.js
//= require lib/model.js
//= require lib/view.js
//= require lib/layer.js
//= require lib/core.js
//= require lib/modal.js
//= require lib/popup.js

// Load View components
//= require component/listview.js
//= require component/listfilter.js


// Load Models
//= require models/project.js

// Load views
//= require views/view.js
//= require views/setting.js
//= require views/console.js
//= require views/watch.js
//= require views/task.js
//= require views/project.js

// Main logic
projectView.switchView();


Guirunt.boot();



})(this);

