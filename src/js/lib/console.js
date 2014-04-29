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
