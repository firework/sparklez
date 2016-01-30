module.exports = Vue.extend({
    template: view('components/modal'),

    data: function() {
        return {
            active: false,
            message: null,
        };
    },

    methods: {
        open: function() {
            this.active = true;
        },

        isActive: function() {
            return this.active;
        },

        close: function() {
            this.active = false;
        },
    },
});
