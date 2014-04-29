var WatchView = View.extend({
    _construct: function() {
        
    }
});

var watchView = new WatchView(
    document.getElementById(View.buttons[2].value),
    { trigger: View.buttons[2] }
);