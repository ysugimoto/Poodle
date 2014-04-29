(function(global) {

var Module, Guirunt, GUI;
var grunt = require('grunt');

Module = Guirunt = global.Guirunt = {};
GUI    = Guirunt.GUI = require('nw.gui');
Module.window = GUI.Window.get().window;

// include config
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



// include libraries
(function(module) {
    
    "use strict";
    
    // Scope stacks
    var LAZY_ID   = 0,
        PARALLELS = [],
        REGEX     = /^is|parallel|promise|then/,
        TO_STRING = Object.prototype.toString,
        PROTOTYPE;
        
    // exports
    module.Lazy = Lazy;
    
    // Check variable is Function
    function isF(fn) {
        return typeof fn === 'function';
    }
    
    // Empty function
    function emptyFunction() {}
    
    // Get status string from status code
    function getStatusString(status) {
        return ( status === Lazy.SUCCESS ) ? 'success' : 
               ( status === Lazy.FAIED )   ? 'failed' :
               ( status === Lazy.ABORT )   ? 'abort' :
               void 0;
    }
    
    // Check object implements Lazy interface
    function isImpl(lazy) {
        return lazy && lazy._interface === 'Lazy';
    }
    
    // Get same lazy
    function getLazy(lazy) {
        return ( lazy instanceof PromisedLazy ) ? lazy.lazy : lazy;
    }
    
    // Signal sender class
    function Signal(lazy) {
        this.lazy = lazy;
    }
    
    Signal.prototype = {
        constructor: Signal,
        
        success: signal_success,
        failed : signal_failed,
        abort  : signal_abort,
        send   : signal_send,
        notify : signal_notify
    };
    
    /**
     * Lazy class
     */
    function Lazy() {
        this.id = ++LAZY_ID;
        // Initial parameters
        this._proceeded = false;
        this._appointID = 0;
        this._status    = Lazy.SUSPEND;
        this._message   = void 0;
        this._progress  = null;
        this._pipes     = { 0x01: null, 0x10: null, 0x11: null };
        this._callbacks = { 0x01: [],   0x10: [],   0x11: []   };
        this._chain     = null;
        
        // Attach signal class instance
        this.signal     = new Signal(this);
    }
    
    // Static status properties
    Lazy.SUSPEND = 0x00;
    Lazy.SUCCESS = 0x01;
    Lazy.FAILED  = 0x10;
    Lazy.ABORT   = 0x11;
    
    // Static create instance
    Lazy.make = function() {
        return new Lazy();
    };
    
    // Attach interface
    Lazy.extend = function(fn) {
        fn._interface = 'Lazy';
        
        return fn;
    };
    
    Lazy.prototype = {
        _interface    : 'Lazy',
        constructor   : Lazy,
        
        pipe          : lazy_pipe,
        success       : lazy_success,
        isSuccess     : lazy_isSuccess,
        failed        : lazy_failed,
        isFailed      : lazy_isFailed,
        abort         : lazy_abort,
        isAbort       : lazy_isAbort,
        always        : lazy_always,
        then          : lazy_then,
        chain         : lazy_chain,
        setAppointID  : lazy_setAppointID,
        getMessage    : lazy_getMessage,
        _changeStatus : lazy_changeStatus,
        _execute      : lazy_execute,
        _process      : lazy_process,
        promise       : lazy_promise,
        progress      : lazy_progress
    };
    
    /**
    * Lazy.Parallel: parallel async class
    */
    Lazy.Parallel = function() {
        var idx = -1,
            parallel;
        
        // Apply Lazy constructor
        Lazy.call(this);
        this._appointID = ++LAZY_ID;
        this._lazy      = [];
        this.parallel   = true;
        
        // Add lazy list from arguments
        while( arguments[++idx] ) {
            parallel = arguments[idx];
            if ( isImpl(parallel) ) {
                parallel.setAppointID(this._appointID);
                this._lazy[this._lazy.length] = parallel;
            }
        }
        
        // Add parallel stack
        PARALLELS[this._appointID] = this;
        
        return this;
    }
    
    Lazy.Parallel.prototype = {
        _interface    : 'Lazy',
        constructor   : Lazy.Parallel,
        
        promise       : lazy_promise,
        success       : lazy_success,
        isSuccess     : lazy_isSuccess,
        failed        : lazy_failed,
        isFailed      : lazy_isFailed,
        abort         : lazy_abort,
        chain         : lazy_chain,
        isAbort       : lazy_isAbort,
        pipe          : lazy_pipe,
        getMessage    : lazy_getMessage,
        _execute      : lazy_execute,
        progress      : lazy_progress,
        _changeStatus : lazy_parallel_changeStatus,
        append        : lazy_parallel_append,
        _process      : lazy_parallel_process
       
    };
    
    /**
     * Create "Promised" Lazy instance
     * @param Lazy lazy
     */
    function PromisedLazy(lazy) {
        this.lazy  = lazy;
    }
    
    PromisedLazy.prototype = {
        _interface  : 'Lazy',
        constructor : PromisedLazy,
        signal      : {
            success: emptyFunction,
            failed : emptyFunction,
            abort  : emptyFunction,
            notify : function(msg) {
                signal_notify.call(this, msg);
            }
        }
    };
    
    // Clone Lazy prototypes
    for ( PROTOTYPE in Lazy.prototype ) {
        if ( ! PROTOTYPE.isPrototypeOf(Lazy.prototype)
             && isF(Lazy.prototype[PROTOTYPE]) ) {
            (function(__proto__) {
                PromisedLazy.prototype[__proto__] = function() {
                    var fn  = Lazy.prototype[__proto__],
                        ret = fn.apply(this.lazy, arguments);
                    
                    return ( REGEX.test(__proto__) )
                             ? ret
                             : this;
                };
            })(PROTOTYPE);
        }
    }
    
    // Signal prototype implements ========================
    
    /**
     * Change status to "success" if allowed
     * @access public
     * @param mixed message
     */
    function signal_success(message) {
        return this.send(Lazy.SUCCESS, message);
    }
    
    /**
     * Change status to "failed" if allowed
     * @access public
     * @param mixed message
     */
    function signal_failed(message) {
        return this.send(Lazy.FAILED, message);
    }
    
    /**
     * Change status to "abort" if alloed
     * @access public
     * @param mixed message
     */
    function signal_abort(message) {
        return this.send(Lazy.ABORT, message);
    }
    
    /**
     * Send a signal
     * @access public
     * @param int status
     */
    function signal_send(status, message) {
        var lazy = this.lazy;
        
        lazy._changeStatus(status, message);
        return lazy;
    }
    
    /**
     * Send notify signal
     * @access public
     * @param mixed msg
     * @return Lazy
     */
    function signal_notify(msg) {
        ( this.lazy._status === Lazy.SUSPEND )
          && isF(this.lazy._progress)
          && this.lazy._progress(msg);
        
        return this.lazy;
    }
    
    // Lazy prototype implements ========================
    
    /**
     * Regist status hooks functions
     * @access public
     * @param function success
     * @param function failed
     * @param function abort
     * @return this
     */
    function lazy_pipe(success, failed, abort) {
        this._pipes[Lazy.SUCCESS] = success;
        this._pipes[Lazy.FAILED]  = failed;
        this._pipes[Lazy.ABORT]   = abort;
        
        return this;
    }
    
    /**
     * Attach success callback function
     * @access public
     * @param function callback
     * @return this
     */
    function lazy_success(callback) {
        this._callbacks[Lazy.SUCCESS].push([callback, 0]);
        this.isSuccess() && this._execute();
       
       return this.promise();
    }
    
    /**
     * Returns Lazy status is Success
     * @access public
     * @return boolean
     */
    function lazy_isSuccess() {
        return this._status === Lazy.SUCCESS;
    }
    
    /**
     * Attach failed callback fucntion
     * @access public
     * @param function callback
     * @return this
     */
    function lazy_failed(callback) {
        this._callbacks[Lazy.FAILED].push([callback, 0]);
        this.isFailed() && this._execute();
        
        return this.promise();
    }
    
    /**
     * Returns Lazy status is Failed
     * @access public
     * @return boolean
     */
    function lazy_isFailed() {
        return this._status === Lazy.FAILED;
    }
    
    /**
     * Attach abort callback function
     * @access public
     * @param function callback
     * @return this
     */
    function lazy_abort(callback) {
        this._callbacks[Lazy.ABORT].push([callback, 0]);
        this.isAbort() && this._execute();
        
        return this._promise()
    }
    
    /**
     * Returns Lazy status is Abort
     * @access public
     * @return boolean
     */
    function lazy_isAbort() {
        return this._status === Lazy.ABORT;
    }
    
    /**
     * Attach callback on al status
     * @access public
     * @param function callback
     * @return PromisedLazy
     */
    function lazy_always(callback) {
        this._callbacks[Lazy.SUCCESS].push([callback, 0]);
        this._callbacks[Lazy.ABORT].push([callback, 0]);
        this._callbacks[Lazy.FAILED].push([callback, 0]);
        
        if ( this.isSuccess() || this.isAbort() || this.isFailed() ) {
            this._execute();
        }
        
        return this.promise();
    }
    
    function lazy_then(success, failed, abort) {
        var chain = new Lazy(),
            types = ['success', 'failed', 'abort'],
            idx   = -1,
            arg,
            type;
        
        while ( arguments[++idx] ) {
            arg  = arguments[idx];
            type = types[idx];
            this[type](function() {
                var resp = isF(arg) ? arg() : arg,
                    lazy;
                
                if ( isImpl(resp) ) {
                    lazy = getLazy(resp);
                    lazy[type](function() {
                        chain.signal[type].apply(chain.signal, arguments);
                    });
                } else {
                    chain.signal[type]();
                }
            });
        }
        
        return new PromisedLazy(chain);
    }
    
    /**
     * Returns chained "promised" Lazy instance
     * @access public
     * @param  string type
     * @return Lazy
     */
    function lazy_chain() {
         this._chain = new Lazy();
         
         return this._chain;
    }
    
    /**
     * Set Parallel appointment ID
     * @access public
     * @param  number appointID
     * @return void
     */
    function lazy_setAppointID(appointID) {
        this._appointID = appointID;
    }
    
    /**
     * Get sended message data
     * @access public
     * @return mixed
     */
    function lazy_getMessage() {
        return this._message;
    }
    
    /**
     * Change status
     * @access protected on this scope
     * @param  int status
     * @param  mixed message
     * @return void
     */
    function lazy_changeStatus(status, message) {
        // If state set true either, nothing to do.
        if ( this._proceeded ) {
            return;
        }
        
        // Mark proceeded
        this._proceeded = true;
        // Change status
        this._status    = status;
        this._message   = message;
        
        // Execute
        this._execute();
    }
    
    /**
     * Execute registed callbacks
     * @access private
     * @param  boolean pipesCallback
     * @return void
     */
    function lazy_execute(pipesCallback) {
        var that      = this,
            idx       = -1,
            status    = this._status,
            callbacks = this._callbacks[status] || [],
            message   = ( isF(this._pipes[status]) && ! pipesCallback )
                          ? this._pipes[status](this._message)
                          : this._message;
        
        // Does pipe function returns Lazy instance?
        if ( isImpl(message) && pipesCallback  ) {
            // More Lazy...
            return message[getStatusString(status)](function(msg) {
                that._message = message.getMessage();
                that._execute(true);
            });
        }
        
        while ( callbacks[++idx] ) {
            if ( isF(callbacks[idx][0]) && callbacks[idx][1] === 0 ) {
                callbacks[idx][1] = 1;
                ( this.parallel )
                  ? callbacks[idx][0].apply(this, message)
                  : callbacks[idx][0](message);
            }
        }
        
        this._process(status, message);
    }
    
    /**
     * Lazy process
     * @access private
     * @param int status
     * @param mixed message
     */
    function lazy_process(status, message) {
        // Does this object has appointment?
        if ( this._appointID > 0 && this._appointID in PARALLELS ) {
            PARALLELS[this._appointID].signal.send(status, message);
        }
        
        // Messaging chain lazy
        this._chains && this._chains[status].signal.send(status, message);
    }
    
    /**
     * Create promised object
     * @access public
     * @return PromisedLazy
     */
    function lazy_promise() {
        return new PromisedLazy(this);
    }
    
    /**
     * Set progress callback
     * @access public
     * @param fucntion callback
     * @return this
     */
    function lazy_progress(callback) {
        this._progress = callback;
        return this;
    }
    
    // Lazy prototype implements ========================
    
    /**
     * Add parallel lazy instance list
     * @access public
     * @param Lazy lazy
     * @return this
     * @throws TypeError
     */
    function lazy_parallel_append(lazy) {
        if ( lazy && lazy._interface === 'Lazy' ) {
            lazy.setAppointID(this._appointID);
            this._lazy[this._lazy.length] = lazy;
            return this;
        }
        throw new Error('Argument must be Lazy instance!');
    }
        
    /**
     * Change status
     * @access public
     * @param Number status
     */
    function lazy_parallel_changeStatus(status, message, pipesCallback) {
        var flag     = true,
            idx      = -1,
            messages = [];
        
        // Guard already proceeded
        if ( this._proceeded ) {
            return;
        }
        
        if ( status === Lazy.SUCCESS ) {
            // Do callback if all green
            while ( this._lazy[++idx] ) {
                if ( isImpl(this._lazy[idx]))
                if ( getLazy(this._lazy[idx])._status != Lazy.SUCCESS ) {
                    flag = false;
                    break;
                }
                messages.push(this._lazy[idx].getMessage());
            }
        }
        else {
            flag = false;
            // Do callback if either failed flag is true
            while ( this._lazy[++idx] ) {
                if ( getLazy(this._lazy[idx])._status == Lazy[status] ) {
                    flag = true;
                }
                messages.push(this._lazy[idx].getMessage())
            }
        }
        
        // Execute callbacks if flag is true
        if ( flag === true ) {
             // Double guard
            this._proceeded = true;
            
            this._status  = status;
            this._message = messages;
            this._execute();
        }
    }
    
    /**
     * Lazy parallel process
     * @access private
     * @param int status
     * @param mixed message
     */
    function lazy_parallel_process(status, message) {
        // Remove stack ( self object reference )
        delete PARALLELS[this._appointID];
    }
    
})(typeof Module !== 'undefined' ? Module : this);

(function(module) {

module.log = function(dat) {
    if ( Module.config.debug ) {
        console.log(dat);
    }
};

})(typeof Module !== 'undefined' ? Module : this);

(function(module) {

var PLATFORM = {
    LINUX:   'linux',
    FREEBSD: 'freebsd',
    MACOS:   'darwin',
    WINDOWS32: 'win32',
    WINDOWS64: 'win64'
};
var OS = require('os');

function Env() {
    this.platform = OS.platform();

    this._linux   = false;
    this._darwin  = false;
    this._windows = false;

    this.spawnProcessName = "";

    Module.log('Env class instanciated. Platform is ' + this.platform);

    this._detect();
}

Env.prototype = {
    constructor:     Env,
    _detect:         env_detect,
    isLinux:         env_islinux,
    isMac:           env_ismac,
    isWindows:       env_iswindows,
    getSpawnCommand: env_getspawncommand
};

function env_detect() {
    switch ( this.platform) {
        case PLATFORM.LINUX:
            this._linux = true;
            this.spawnProcessName = 'bash';
            break;
        case PLATFORM.MACOS:
            this._darwin = true;
            this.spawnProcessName = 'bash';
            break;
        case PLATFORM.FREEBSD:
            this._linux = true;
            this.spawnProcessName = 'sh';
            break;
        case PLATFORM.WINDOWS32:
        case PLATFORM.WINDOWS64:
            this._windows = true;
            this.spawnProcessName = 'cmd.exe';
            break;
        default:
            throw new Error('Unsupported Platform: ' + this.platform);
    }

    Module.log('Platform detected: ' + this.platform);
}

function env_islinux() {
    return this._linux;
}

function env_ismac() {
    return this._darwin;
}

function env_iswindows() {
    return this._windows;
}

function env_getspawncommand() {
    return this.spawnProcessName;
}

module.env = new Env();

})(typeof Module !== 'undefined' ? Module : this);

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

(function(module) {

var child        = require('child_process');
var EventEmitter = require('events').EventEmitter;
var PROP;

function Console(element) {
    if ( ! this instanceof Console ) {
        return new Console(element);
    }

    EventEmitter.call(this);

    this.commandStack = [];
    this.proc         = null;
    this._stdoutData  = "";
    this._processing  = null;

    Module.log('Console class instanciated');
}

Console.CODE_SUCCESS = 0;

Console.prototype = {
  Constructor: Console,
  _spawn:      console_spawn,
  exec:        console_exec,
  // Event handlers
  onStdErr:    console_onstderr,
  onStdOut:    console_onstdout,
  onClose:     console_onclose
};

for ( PROP in EventEmitter ) {
  Console.prototype[PROP] = EventEmitter.prototype[PROP];
}


function console_spawn() {
    if ( ! this.proc ) {
        Module.log('Spawn command: ' + Module.env.getSpawnCommand());
        this.proc = child.spawn(Module.env.getSpawnCommand());

        this.proc.stderr.on('data', this.onStdErr.bind(this));
        this.proc.stdout.on('data', this.onStdOut.bind(this));
        this.proc.on('close', this.onClose.bind(this));
    }

    return this.proc;
}

function console_exec(cmd) {
    var proc;

    if ( this._processing ) {
        this.commandStack.push(cmd);
        Module.log('Command is now running. queued: ' + cmd);
        return;
    }

    Module.log('Command is accepted: ' + cmd);
    this._processing = new Module.Lazy();
    proc = this._spawn();
    proc.stdin.write(cmd);
    proc.stdin.end();
}


function console_onstderr(chunk) {
    console.log('err: ' + chunk);
    this.emit('stderr', chunk);
}


function console_onstdout(chunk) {
    console.log('out: ' + chunk);
    this._stdoutData += chunk;
    this.emit('stdout', chunk);
}

function console_onclose(code) {
    Module.log('Process closed. responseCode:  ' + code);
    if ( code === Console.CODE_SUCCESS ) {
        this._processing.signal.sucess(this._stdoutData);
    } else {
        this._processing.signal.failed();
    }

    this._stdoutData = "";
    this._processing = null;
    this.proc.stderr.off('data');
    this.proc.stderr.off('data');
    this.proc.off('close');
}

})(typeof Module !== 'undefined' ? Module : this);

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

(function(module) {
    
    var DB = openDatabase('guirunt', '1.0', 'guirunt data storage', 2 * 1024 * 1024);
    
    function Database() {}
    
    Database._initDB = function() {
        DB.transaction(function(trans) {
            trans.executeSql("CREATE TABLE IF NOT EXISTS projects (project_path TEXT, project_name TEXT);", [],
                function(trans, result) { console.log('Create project table success'); },
                function(trans, err) { console.log("Failed to create table: " + err.message); }
            );

            trans.executeSql("CREATE TABLE IF NOT EXISTS project_tasks (project_name TEXT, task_name TEXT)", [],
                function(trans, result) { console.log('Create project_tasks table success'); },
                function(trans, err) { console.log("Failed to create table: " + err.message); }
            );
            
            trans.executeSql("CREATE TABLE IF NOT EXISTS task_settings (task_name TEXT, setting_data TEXT)", [],
                function(trans, result) { console.log('Create task_settings table success'); },
                function(trans, err) { console.log("Failed to create table: " + err.message); }
            );
        });
    };

    Database.query = function(sql, _bind) {
        var lazy = new module.Lazy(),
            bind = _bind || [];
        
        DB.transaction(function(trans) {
            transaction = trans;
            trans.executeSql(sql, bind, 
                function(trans, result) {
                    var ret = [],
                        i   = 0;
                    
                    if ( /^insert/i.test(sql) ) {
                        lazy.signal.success(result.insertId);
                    } else if ( /^(update|delete)/i.test(sql) ) {
                        lazy.signal.success(result.rowAffected);
                    } else {
                        for ( ; i < result.rows.length; ++i ) {
                            ret[i] = result.rows.item(i);
                        }
                        lazy.signal.success(ret);
                    }
                },
                function (trans, error) {
                    lazy.signal.failed(error);
                }
            );
        });
        
        return lazy;
    };
    
    module.db = Database;
    
})(typeof Module !== 'undefined' ? Module : this);

(function(module) {
    
    var http = require('http');
    
    module.http = _http;
    
    function _http(options, callback) {
        var lazy = new module.Lazy();
        
        callback && lazy.success(callback);
        
        http.get(options, function(response) {
            var body = "";
            
            if ( response.statusCode != 200 ) {
                lazy.signal.failed(response);
                return;
            }
            response.setEncoding('utf8');
            response.on('data', function(chunk) {
                body += chunk;
            });
            response.on('end', function() {
                lazy.signal.success(body);
            });
        });
        
        return lazy.promise();
    }
    
})(typeof Module !== 'undefined' ? Module : this);


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

// Application logic
Guirunt.boot = function() {
    // Initialized check
    if ( ! Module.storage.exists('Guirunt_initialized') ) {
        // Initialize application
        console.log('Application is not initialized.');
        // Create database
        Module.db._initDB();
        Module.storage.set('Guirunt_initialized', 1);
    }
    
    //Module.ui.init();
};

Guirunt.initProject = function(projectPath) {
    if ( ! grunt.file.isDir(projectPath) ) {
        return Module.window.alert('ディレクトリではありません');
    }

    // Save storage
    Module.db.query('INSERT INTO projects VALUES (?)', [projectPath])
    .success(function() {
        Module.window.alert('Successfully added project.');
    })
    .failed(function(err) {
        console.log(err.message);
    });
};

Guirunt.currentView = null;
Guirunt.boot();
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


// Load View components
var ListView = Guirunt.View.extend({
    _construct: function(list, options) {
        this.list       = list;
        this.listParent = null;

        Module.util.mixin(this, options || {});

        this.createList();
        if ( this.filters ) {
            this.filterView = new ListFilter(this.listParent.childNodes);
        }
    },

    createList: function() {
        var doc  = document,
            wrap = doc.createDocumentFragment(),
            ul   = doc.createElement('ul'),
            li;
        
        ul.className = 'guirunt-listview';
        this.list.forEach(function(data) {
            li = doc.createElement('li');
            li.appendChild(doc.createTextNode(data));

            if ( typeof this.onGenerate === 'function' ) {
                this.onGenerate(li);
            }
            
            wrap.appendChild(li);
        }.bind(this));

        ul.appendChild(wrap);
        ul.addEventListener('click', this, false);
        this.listParent = ul;
    },

    handleEvent: function(evt) {
        var element = evt.target;

        while ( element !== this.listParent &&  ! element.webkitMatchesSelector('ul.guirunt-listview > li') ) {
            element = element.parentNode;
        }

        this.onClick && this.onClick(evt);
    },

    /** @override **/
    appendTo: function(node) {
        if ( this.filters ) {
            this.filterView.appendTo(node);
        }
        node.appendChild(this.listParent);
    },

    destroy: function() {
        if ( this.filters ) {
            this.filterView.destroy();
        }
        this.listParent.removeventListner('click', this);
        this.listParent.parentNote.removeChild(this.listParent);
    }
});

var ListFilter = Guirunt.View.extend({
    _construct: function(nodeList) {
        this.targets  = [];            

        this.factory(nodeList);
        this.genComponent();
    },

    factory: function(nodeList) {
        var i    = -1,
            size = nodeList.length;
        
        while ( nodeList[++i] ) {
            this.targets.push([nodeList[i].textContent, nodeList[i]]);
        }
    },

    genComponent: function() {
        var doc      = document,
            section  = doc.createElement('section'),
            input    = doc.createElement('input');

        section.className = 'guirunt-listfilter';
        section.appendChild(input);

        input.type  = 'text';
        input.name  = 'q';
        input.value = '';
        input.addEventListener('keyup', this, false);

        this.input = input;
    },

    handleEvent: function(evt) {
        var value = evt.target.value,
            i     = -1,
            size  = this.targets.length,
            target;
        
        while ( this.targets[++i] ) {
            target = this.targets[i];
            if ( value === '' || target[0].indexOf(value) !== -1 ) {
                target[1].style.display = 'block';
            } else {
                target[1].style.display = 'none';
            }
        }
    },

    appendTo: function(node) {
        node.appendChild(this.input.parentNode);
        this.input.focus();
    },

    destroy: function() {
        this.input.removeEventListener('click', this);
        this.input.parentNode.parentNode.removeChild(this.input.parentNode);
    }


});



// Load Models
function DragDrop(callback) {
    this.callback = callback;

    this.layer = new Module.Layer();
    this.setUp();
}

DragDrop.prototype.setUp = function() {
    var doc = document;

    doc.addEventListener('dragenter', this, false);
    doc.addEventListener('dragover',  this, false);
    doc.addEventListener('dragleave', this, false);
                        
    // Drop element event handle
    this.layer.addEventListener('dragenter', this.cancelEvent, false);
    this.layer.addEventListener('dragover',  this.cancelEvent, false);
    this.layer.addEventListener('dragleave', this,        false);
    this.layer.addEventListener('drop',      this,        false);

    Module.log('D&D Event setup completed.');
};

DragDrop.prototype.cancelEvent = function(evt) {
    evt.preventDefault();
    evt.stopPropagation();
};

DragDrop.prototype.handleEvent = function(evt) {
    switch ( evt.type ) {
        case 'dragenter':
        case 'dragover':
              this.dragInit(evt);
            break;
        case 'dragleave':
            this.dragEnd(evt);
            break;
        case 'drop':
            this.dropFile(evt);
            break;
        default :
            break;
    }
};

DragDrop.prototype.dragInit = function(evt) {
    this.layer.show();
};

DragDrop.prototype.dragEnd = function(evt) {
    evt.preventDefault();
    if ( evt.pageX < 1 || evt.pageY < 1 ) {
        this.layer.hide();
    }
};

DragDrop.prototype.dropFile = function(evt) {
    this.cancelEvent(evt);
    this.layer.hide();

    var files = evt.dataTransfer.files,
        i     = -1;

    while ( files[++i] ) {
        this.callback(files[i]);
    }
};


var ProjectModel = Guirunt.Model.extend({
    _construct: function() {
        this.ddHandle = new DragDrop(this.addProject.bind(this));
    },

    addProject: function(file) {
        var filePath = file.path;

        if ( ! grunt.file.isDir(filePath) ) {
            return Module.modal.dialogalert('ドロップされたファイルはディレクトリではありません。');
        }

        this.checkGruntFile(filePath);
    },

    addProjectFromFileSelect: function(file) {
        var relPath   = file.webkitRelativePath,
            basePath  = file.path.slice(0, file.path.indexOf(relPath)),
            directory = relPath.slice(0, relPath.indexOf('/'));

        this.addProject({path: basePath + directory});
    },

    handleEvent: function(evt) {
        
        switch ( evt.type ) {
            case 'change': // add project
                this.addProjectFromFileSelect(evt.target.files[0]);
                break;
        }
    },

    checkGruntFile: function(filePath) {
        // Gruntfile.js already exists?
        if ( grunt.file.exists(filePath + '/Gruntfile.js') ) {
            Module.modal.confirm('すでにGruntfile.jsが存在します。¥n設定をインポートしますか？')
                  .success(function() {
                      Guirunt.importConfig(require(filePath + '/Gruntfile.js'));
                      this.checkPackageJSON(filePath);
                  }.bind(this))
                  .failed(function() {
                      this.checkPackageJSON(filePath);
                  }.bind(this));
        } else {
            this.checkPackageJSON(filePath);
        }
    },

    checkPackageJSON: function(filePath) {
        // package.json exits?
        if ( grunt.file.exists(filePath + '/package.json') ) {
            Module.modal.dialog('package.jsonが見つかりました。¥n依存パッケージをインストールします。')
                  .success(function() {
                        var cmd = new Module.console();

                        cmd.exec('npm install --prefix=' + filePath)
                             .success(function() {
                                this.createProject(filePath);
                             }.bind(this));
                  }.bind(this));
        } else {
            Module.log('TODO: implement intialize package.json');
            this.createProject(filePath);
        }
    },
    
    createProject: function(projectPath) {
        var projectName = require('path').basename(projectPath);
        
        // Save storage
        Module.db.query('INSERT INTO projects (project_path, project_name) VALUES (?, ?)', [projectPath, projectName])
        .success(function() {
            this.trigger('addProject', projectName);
            Module.modal.dialog('Successfully added project.');
        }.bind(this))
        .failed(function(err) {
            console.log(err.message);
        });
    },
    
    changeProject: function(element) {
        this.currentProject = element;
        this.trigger('changeProject', element.getAttribute('data-projectname'));
    },

    getCurrentProject: function() {
        return this.currentProject;                   
    },
    
    loadProjects: function() {
        var that = this;
        
        // Get saved projects
        Module.db.query('SELECT * FROM projects;')
        .success(function(projects) {
            console.log(projects);
            projects.forEach(function(project) {
                that.trigger('addProject', project.project_name);
            });
        });
    }

});

var projectModel = new ProjectModel();


// Load views
var View = Guirunt.View.extend({
    _construct: function() {
        Guirunt.View.apply(this, arguments);
        this.trigger.addEventListener('change', this.switchView.bind(this), false);
    },
    switchView: function() {
        Module.util.addClass(this.element, 'active');
        Guirunt.currentView && Module.util.removeClass(Guirunt.currentView.element, 'active');
        Guirunt.currentView = this;
    }
});

View.buttons = document.querySelectorAll('.widget-navi input[type=radio]');

var settingView = View.extend({
    _construct: function() {
        
    }
}).make(
    '#' + View.buttons[4].value,
    { trigger: View.buttons[4] }
);
var ConsoleView = View.extend({
    _construct: function() {
        
    }
});

consoleView = new ConsoleView(
    document.getElementById(View.buttons[3].value),
	{ trigger: View.buttons[3] }
);
var WatchView = View.extend({
    _construct: function() {
        
    }
});

var watchView = new WatchView(
    document.getElementById(View.buttons[2].value),
    { trigger: View.buttons[2] }
);
var TaskView = View.extend({
    _construct: function() {
        this.head     = this.element.querySelector('h1');
        this.taskList = this.element.querySelector('.widget-task-list');
        this.addTask  = this.element.querySelector('button[data-role="addtask"]');
        this.delTask  = this.element.querySelector('button[data-role="deltask"]');
        
        this.initialize();
    },

    initialize: function() {
        this.listenTo(projectModel, 'changeProject', 'handleChangeProject');
        //this.taskList.addEventListener('click', this.handleTaskClicked.bind(this), false);
        this.addTask.addEventListener('click', this.handleAddTask.bind(this), false);
        //this.delTask.addEventListener('click', this.handleDelTask.bind(this), false);
    },
    
    handleChangeProject: function(evt) {
        this.head.innerHTML = '<span class="project-name">' + evt.data + '</span> のタスク';
        // Get task list
        Module.db.query('SELECT task_name FROM project_tasks WHERE project_name = ?', [evt.data])
            .success(function(taskList) {
                this.createTaskList(taskList);
            }.bind(this))
            .failed(function() {
                this.createTaskList([]);
            }.bind(this));
    },

    handleAddTask: function(evt) {
        var modal   = new Module.SelectableList(['hoge', 'huga', 'piyo']),
            project = projectModel.getCurrentProject();

        if ( ! project ) {
            return modal.destroy();
        }

        console.log(modal);
        modal.show();

        
    },

    createTaskList: function(taskList) {
        var node  = this.taskList,
            doc   = document,
            label,
            span,
            input;

        while ( node.firstChild ) {
            node.removeChild(node.firstChild);
        }
        
        taskList.forEach(function(task) {
            label = doc.createElement('label');
            span  = doc.createElement('span');
            input = doc.createElement('input');

            input.setAttribute('name', 'task');
            input.setAttribute('type', 'radio');
            span.className = 'label';
            span.appendChild(doc.createTextNode(task));

            label.appendChild(input);
            label.appendChild(span);
            label.setAttribute('data-taskname', task);

            node.appendChild(label);
        });
    }
});

var taskView = new TaskView(
    document.getElementById(View.buttons[1].value),
    { trigger: View.buttons[1] }
);

var ProjectView = View.extend({
    _construct: function() {
        this.projectList = this.element.querySelector('.widget-project-list');
        this.addProjectInput = this.element.querySelector('#add-project-btn');
        
        this.listenTo(this.model, 'addProject', function(evt) {
            this.createProjectNode(evt.data);
        }.bind(this));
        
        this.projectList.addEventListener('click', this.setProject.bind(this), false);
        this.model.loadProjects();
        this.initAddProjectEvent();
    },

    initAddProjectEvent: function() {
        var btn  = this.element.querySelector('button[data-role="addproject"]');

        this.addProjectInput.addEventListener('change', this.model, false);
        btn.addEventListener('click', this.selectFile.bind(this), false);
    },
    
    selectFile: function(evt) {
        var dispatcher = document.createEvent('MouseEvent');

        dispatcher.initEvent('click', false, false, false);
        this.addProjectInput.dispatchEvent(dispatcher);
    },

    setProject: function(evt) {
        var element = evt.target;
        
        if ( /INPUT|SPAN/.test(element.tagName) ) {
            element = element.parentNode;
        }
        this.model.set('currentProject', element);
    },
    
    createProjectNode: function(projectName) {
        var label = document.createElement('label'),
            input = document.createElement('input'),
            span  = document.createElement('span');
        
        input.type  = 'radio';
        input.name  = 'project';
        input.value = projectName;
        
        span.className = 'label';
        span.appendChild(document.createTextNode(projectName));
        
        label.appendChild(input);
        label.appendChild(span);
        
        label.setAttribute('data-projectname', projectName);
        
        this.projectList.appendChild(label);
        if ( this.projectList.childNodes.length === 1 ) {
            this.model.changeProject(label);
        }
    }
});

var projectView = new ProjectView(document.getElementById(View.buttons[0].value), {
    trigger: View.buttons[0],
    model: projectModel
});


// Main logic
projectView.switchView();


Guirunt.boot();



})(this);

