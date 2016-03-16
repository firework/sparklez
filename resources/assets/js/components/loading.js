module.exports = {
    template: require('./../../../views/components/loading.html'),

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
};
