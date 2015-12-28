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
            var that = this;

            that.loading().start();

            that.sequelize = new Sequelize(that.database, that.username, that.password, {
                host: that.server,
                port: that.port
            });

            that.sequelize.authenticate().then(function(errors) {
                var sequelizeAuto = new SequelizeAuto(that.database, that.username, that.password, {
                    host: that.server,
                    port: that.port
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
                        that.loading().stop();
                    }

                    that.active = true;
                    that.loaded = false;

                    that.$parent.database.create();
                });
            }).catch(function(errors) {
                alert('Wrong credentials, please try again.');
                that.loading().stop();
            });
        },
    },
});
