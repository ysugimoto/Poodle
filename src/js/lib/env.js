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
