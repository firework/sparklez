module.exports = {
    el: '#app',

    components: {
        'tabs': require('./tabs'),
    },

    data: function() {
        return {
            tab: null,
        };
    },

    methods: {
        isConnected: function() {
            return this.tab && this.tab.connection.active;
        }
    },
};
