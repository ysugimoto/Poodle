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
