var Sequelize = require('sequelize'),
    SequelizeAuto = require('sequelize-auto');

module.exports = Vue.extend({
    template: view('connection'),

    props: ['connection'],

    methods: {
        connect: function() {
            var that = this;

            that.$root.loading = true;

            that.connection.sequelize = new Sequelize(that.connection.database, that.connection.username, that.connection.password, {
                host: that.connection.server,
                port: that.connection.port
            });

            that.connection.sequelize.authenticate().then(function(errors) {
                var sequelizeAuto = new SequelizeAuto(that.connection.database, that.connection.username, that.connection.password, {
                    host: that.connection.server,
                    port: that.connection.port
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
                    }

                    that.connection.active = true;
                    that.connection.loaded = false;
                });
            }).catch(function(errors) {
                alert('Wrong credentials, please try again.');
            });
        },
    },
});
