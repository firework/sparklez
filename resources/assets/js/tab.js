module.exports = {
    template: require('./../../views/tab.html'),

    components: {
        'connection': require('./connection'),
        'database': require('./database'),
        'loading': require('./components/loading'),
    },

    props: [
        'tab',
        'name',
        'active'
    ],

    methods: {
        connection: function() {
            return this.$refs.connection;
        },

        database: function() {
            return this.$refs.database;
        },

        loading: function() {
            return this.$refs.loading;
        },

        isActive: function() {
            return this.active;
        },

        disconnect: function() {
            if (this.connection().active) {
                this.connection().active = false;
            }
        },

        isConnected: function() {
            if (this.active) this.tab = this;

            return this.active && this.connection().active;
        },

        isNotConnected: function() {
            return this.active && !this.connection().active;
        },
    },
};
