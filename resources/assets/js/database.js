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

    filters: {
        limit: function(value, qty) {
            value = String(value);
            qty = qty || 50;

            if (value.length < qty) return value;

            return value.substr(0, qty) +  ' ...';
        }
    },

    methods: {
        connection: function() {
            return this.$parent.connection();
        },

        loading: function() {
            return this.$parent.loading();
        },

        isTableActive: function(table) {
            return table == this.tableActive;
        },

        setTableActive: function(table) {
            this.model = require(sequelizeDir + '/' + table)(this.connection().sequelize, Sequelize);

            var columns = Object.keys(this.model.attributes);

            this.loading().start();


            this.model.findAll({
                attributes: columns,
            }).then(function(result) {
                var rows = [];

                for (x in result) {
                    rows.push(result[x].dataValues);
                }

                this.tableActive = table;
                this.columns = columns;
                this.rows = rows;
            }.bind(this)).done(function(e) {
                this.loading().stop();
            }.bind(this));
        },

        create: function() {
            if (this.connection().loaded) return;

            fs.readdir(sequelizeDir, function(err, files) {
                for (x in files) {
                    files[x] = files[x].replace('.js', '');
                }

                this.tables = files;
                this.setTableActive(files[0]);
                this.connection().loaded = true;
                this.loading().stop();
            }.bind(this));
        },
    },
});
