module.exports = Vue.extend({
    template: view('tab'),

    components: {
        'connection': require(jsDir + '/connection'),
        'database': require(jsDir + '/database'),
    },

    props: ['tab', 'name', 'active'],

    data: function() {
        return {
            connection: {
                active: false,
                loaded: false,
                server: null,
                port: null,
                username: null,
                password: null,
                database: null,
                sequelize: null,
                tableActive: null,
                model: null,
                tables: [],
                columns: [],
                rows: [],
            },
        };
    },

    methods: {
        connect: function() {
            this.$children[0].connect();
        },

        disconnect: function() {
            this.connection.active = false;
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
