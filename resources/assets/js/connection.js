var Sequelize = require('sequelize');

module.exports = Vue.extend({
    template: view('connection'),

    data: function() {
        return {
            favorites: [
                {
                    name: 'New Connection',
                    server: null,
                    port: null,
                    username: null,
                    password: null,
                    database: null,
                },
                {
                    name: 'Homestead',
                    server: 'localhost',
                    port: '33060',
                    username: 'homestead',
                    password: 'secret',
                    database: 'homestead',
                },
            ],
            favorite: 0,
            active: false,
            loaded: false,
            server: null,
            port: null,
            username: null,
            password: null,
            database: null,
            sequelize: null,
            queryInterface: null,
        };
    },

    methods: {
        loading: function() {
            return this.$parent.loading();
        },

        isFavoriteActive: function(index) {
            return this.favorite === index;
        },

        setFavoriteActive: function(index) {
            this.favorite = index;

            for (x in this.favorites[index]) {
                if (x == 'name') continue;

                this[x] = this.favorites[index][x];
            }
        },

        connect: function() {
            this.loading().start();

            this.sequelize = new Sequelize(this.database, this.username, this.password, {
                host: this.server,
                port: this.port
            });

            this.sequelize.authenticate().then(function(errors) {
                this.queryInterface = this.sequelize.getQueryInterface();

                this.active = true;
                this.loaded = false;

                this.$parent.database().create();
            }.bind(this)).catch(function(errors) {
                alert('Wrong credentials, please try again.');
                this.loading().stop();
            }.bind(this));
        },
    },
});
