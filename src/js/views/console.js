var ConsoleView = View.extend({
    _construct: function() {
        
    }
});

consoleView = new ConsoleView(
    document.getElementById(View.buttons[3].value),
	{ trigger: View.buttons[3] }
);