var Sequelize = require('sequelize');

module.exports = Vue.extend({
    template: view('database'),

    components: {
        'row': require(jsDir + '/row'),
        'modal': require(jsDir + '/components/modal'),
    },

    data: function() {
        return {
            tableActive: null,
            model: null,
            tables: [],
            columns: [],
            rows: [],
            sort: {
                column: null,
                asc: null,
            },
            updating: {
                row: null,
                column: null,
                type: null,
                value: null,
                saving: false,
            }
        };
    },

    methods: {
        connection: function() {
            return this.$parent.connection();
        },

        loading: function() {
            return this.$parent.loading();
        },

        modal: function() {
            return this.$refs.modal;
        },

        isTableActive: function(table) {
            return table == this.tableActive;
        },

        getColumnsByRow: function(result) {
            return Object.keys(result);
        },

        setTableActive: function(table) {
            this.clearUpdating();

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
                this.sort.column = null;
                this.sort.asc = null;
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

        clearUpdating: function() {
            this.updating.column = null;
            this.updating.row = null;
            this.updating.type = null;
            this.updating.value = null;
        },

        modalClose: function() {
            this.clearUpdating();
            this.modal().close();
        },

        save: function() {
            if (this.updating.column === null || this.updating.saving === true) return;

            // Check any changes
            if (this.rows[this.updating.row][this.columns[this.updating.column]] == this.updating.value) {
                this.clearUpdating();
                return;
            }

            this.updating.saving = true;

            this.loading().start();

            // Create params for update
            values = {};
            options = {};

            // Get column name
            column = this.columns[this.updating.column];
            values[column] = this.updating.value;

            // Get row
            row = this.rows[this.updating.row];
            options.where = row;

            this.model.update(values, options).then(function(results) {
                if (this.modal().isActive()) {
                    this.modal().close();
                };

                this.rows[this.updating.row][column] = this.updating.value;
                this.clearUpdating();
                this.updating.saving = false;

                this.loading().stop();
            }.bind(this));
        },

        sortColumn: function(column) {
            this.sort.asc = this.sort.column == column ? !this.sort.asc : true;
            this.sort.column = column;
        }
    },
});
