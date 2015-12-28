var Sequelize = require('sequelize'),
    SequelizeAuto = require('sequelize-auto');

module.exports = Vue.extend({
    template: view('connection'),

    data: function() {
        return {
            active: false,
            loaded: false,
            server: null,
            port: null,
            username: null,
            password: null,
            database: null,
            sequelize: null,
        };
    },

    methods: {
        loading: function() {
            return this.$parent.loading();
        },

        connect: function() {
            this.loading().start();

            this.sequelize = new Sequelize(this.database, this.username, this.password, {
                host: this.server,
                port: this.port
            });

            this.sequelize.authenticate().then(function(errors) {
                var sequelizeAuto = new SequelizeAuto(this.database, this.username, this.password, {
                    host: this.server,
                    port: this.port
                });

                sequelizeAuto.run({
                    spaces: true,
                    indentation: 4,
                    directory: sequelizeDir,
                    additional: {
                        timestamps: false,
                    }
                }, function(err){
                    if (err) {
                        alert('Something went wrong, please try again.');
                        this.loading().stop();
                    }

                    this.active = true;
                    this.loaded = false;

                    this.$parent.database().create();
                }.bind(this));
            }.bind(this)).catch(function(errors) {
                alert('Wrong credentials, please try again.');
                this.loading().stop();
            }.bind(this));
        },
    },
});
