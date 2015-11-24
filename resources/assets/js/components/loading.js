module.exports = Vue.extend({
    template: view('components/loading'),

    data: function() {
        return {
            active: false,
            message: null,
            defaultMessage: 'Loading...',
        };
    },

    methods: {
        start: function(message) {
            this.message = message ? message : this.defaultMessage;
            this.active = true;
        },

        isActive: function() {
            return this.active;
        },

        stop: function() {
            this.active = false;
        },
    },

    created: function() {
        this.$parent.loading = this;
    },
});
