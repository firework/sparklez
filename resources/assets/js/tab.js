module.exports = Vue.extend({
    template: view('tab'),

    components: {
        'connection': require(jsDir + '/connection'),
        'database': require(jsDir + '/database'),
        'loading': require(jsDir + '/components/loading'),
    },

    props: ['tab', 'name', 'active'],

    data: function() {
        return {
            connection: null,
            database: null,
            loading: null,
        };
    },

    methods: {
        isActive: function() {
            return this.active;
        },

        disconnect: function() {
            if (this.connection.active) {
                this.connection.active = false;
            }
        },

        isConnected: function() {
            if (this.active) this.tab = this;

            return this.active && this.connection.active;
        },

        isNotConnected: function() {
            return this.active && !this.connection.active;
        },
    },
});
