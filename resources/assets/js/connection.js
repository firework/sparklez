module.exports = {
    template: require('./../../views/connection.html'),

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

            for (var x in this.favorites[index]) {
                if (x == 'name') continue;

                this[x] = this.favorites[index][x];
            }
        },

        connect: function() {
            this.loading().start();

            this.$http.post('http://localhost:3000/connect', {
                database: this.database,
                username: this.username,
                password: this.password,
                host: this.server,
                port: this.port,
                id: this.$parent._uid,
            }).then(function(response) {
                console.log(response.data);

                if (response.data.status == 'OK') {
                    this.active = true;
                    this.loaded = false;

                    this.$parent.database().create();
                } else {
                    alert('Wrong credentials, please try again.');
                    this.loading().stop();
                }
            }.bind(this));
        },
    },
};
