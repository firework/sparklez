module.exports = {
    template: require('./../../../views/components/modal.html'),

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
};
