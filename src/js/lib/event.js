(function(module) {

function Event() {
    this._listeners = {};
}

Event.prototype =  {
    constructor: Event,
    on:          event_on,
    off:         event_off,
    trigger:     event_trigger,
    once:        event_once
};

function event_on(element, type, callback) {
    var target;

    if ( element instanceof module.View ) {
        target = element.element;
        if ( typeof target['on' + type] === 'undefined' ) {
            element.on(type, callback.bind(element));
        } else {
            target.addEventListener(type, callback.bind(element));
        }
    } else if ( element instanceof module.Model ) {
        element.on(type, callback.bind(element));
    }
}

function event_off(element, type, callback) {
    var target;

    if ( element instanceof module.View ) {
        target = element.element;
        if ( typeof target['on' + type] === 'undefined' ) {
            element.removeListener(type, callback.bind(element));
        } else {
            target.removeEventListener(type, callback);
        }
    } else if ( element instanceof module.Model ) {
        element.removeListener(type, callback.bind(element));
    }
}

function event_once(element, type, callback) {
    var target;

    if ( element instanceof module.View ) {
        target = element.element;
        if ( typeof target['on' + type] === 'undefined' ) {
            element.once(type, callback.bind(element));
        } else {
            target.addEventListener(type, function(evt) {
                callback.call(element, evt);
            });
        }
    } else if ( element instanceof module.Model ) {
        element.once(type, callback);
    }
}

function event_trigger(type, data) {
    var target,
        event;

    if ( element instanceof module.View ) {
        target = element.element;
        if ( typeof target['on' + type] === 'undefined' ) {
            element.emit(type, {data: data});
        } else {
            event = document.createEvent('Event');
            event.initEvent(type, true, true, true);
            event.data = data;
            target.dispatchEent(event);
        }
    } else if ( element instanceof module.Model ) {
        element.emit(type, {data: data});
    }
}

module.event = new Event();

})(typeof Module !== 'undefined' ? Module: this);
