var Sequelize = require('sequelize');

module.exports = Vue.extend({
    template: view('database'),

    data: function() {
        return {
            tableActive: null,
            model: null,
            tables: [],
            columns: [],
            rows: [],
        };
    },

    computed: {
        connection: function() {
            return this.$parent.connection;
        },
        loading: function() {
            return this.$parent.loading;
        },
    },

    methods: {
        isTableActive: function(table) {
            return table == this.tableActive;
        },

        setTableActive: function(table) {
            this.model = require(sequelizeDir + '/' + table)(this.connection.sequelize, Sequelize);

            var that = this,
                columns = Object.keys(this.model.attributes);

            that.loading.start();

            that.model.findAll({
                attributes: columns,
            }).then(function(result) {
                var rows = [];

                for (x in result) {
                    rows.push(result[x].dataValues);
                }

                that.tableActive = table;
                that.columns = columns;
                that.rows = rows;
            }).done(function(e) {
                that.loading.stop();
            });
        },

        create: function() {
            var that = this;

            if (that.connection.loaded) return;

            fs.readdir(sequelizeDir, function(err, files) {
                for (x in files) {
                    files[x] = files[x].replace('.js', '');
                }

                that.tables = files;
                that.setTableActive(files[0]);
                that.connection.loaded = true;

                that.loading.stop();
            });
        },
    },

    created: function() {
        this.$parent.database = this;
    },
});
