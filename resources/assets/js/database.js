var Sequelize = require('sequelize');

module.exports = Vue.extend({
    template: view('database'),

    props: ['connection'],

    methods: {
        isTableActive: function(table) {
            return table == this.connection.tableActive;
        },

        setTableActive: function(table) {
            this.connection.model = require(sequelizeDir + '/' + table)(this.connection.sequelize, Sequelize);

            var that = this,
                columns = Object.keys(this.connection.model.attributes);

            that.connection.model.findAll({
                attributes: columns,
            }).then(function(result) {
                var rows = [];

                for (x in result) {
                    rows.push(result[x].dataValues);
                }

                that.connection.tableActive = table;
                that.connection.columns = columns;
                that.connection.rows = rows;
            });
        },
    },

    created: function() {
        var that = this;

        if (that.connection.loaded) return;

        fs.readdir(sequelizeDir, function(err, files) {
            for (x in files) {
                files[x] = files[x].replace('.js', '');
            }

            that.connection.tables = files;
            that.setTableActive(files[0]);
            that.connection.loaded = true;
        });
    },
});
