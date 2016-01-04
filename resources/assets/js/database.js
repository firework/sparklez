var Sequelize = require('sequelize');

module.exports = Vue.extend({
    template: view('database'),

    components: {
        'row': require(jsDir + '/row'),
    },

    data: function() {
        return {
            tableActive: null,
            model: null,
            tables: [],
            columns: [],
            rows: [],
            updating: {
                column: null,
                row: null,
                type: null,
            }
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

        modal: function() {
            return this.$parent.modal();
        },

        isTableActive: function(table) {
            return table == this.tableActive;
        },

        getColumnsByRow: function(result) {
            return Object.keys(result);
        },

        setTableActive: function(table) {
            this.model = require(sequelizeDir + '/' + table)(this.connection().sequelize, Sequelize);

            var columns = Object.keys(this.model.attributes);

            this.loading().start();

            this.model.sequelize.query("SELECT * FROM "+this.model.name+" as "+this.model.name, {
                type: this.model.sequelize.QueryTypes.SELECT
            }).then(function(result) {
                var rows = [];

                if (typeof(result[0]) != 'undefined') {
                    columns = this.getColumnsByRow(result[0]);
                }

                for (x in result) {
                    rows.push(result[x]);
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
