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

            this.connection().queryInterface.describeTable(table).then(function(attributes) {
                var columns = Object.keys(attributes);

                this.loading().start();

                this.tableActive = null;
                this.columns = [];
                this.rows = [];
                this.sort.column = null;
                this.sort.asc = null;

                this.model = this.connection().sequelize.define(table, attributes, {
                    tableName: table,
                    timestamps: false,
                    freezeTableName: true
                });

                this.model.findAll({
                    limit: 50,
                }).then(function(rows) {
                    this.tableActive = table;
                    this.columns = columns;
                    this.rows = rows.map(function(row) {
                        return row.toJSON();
                    });
                    this.loading().stop();
                }.bind(this));
            }.bind(this));
        },

        create: function() {
            if (this.connection().loaded) return;

            this.connection().queryInterface.showAllTables().then(function(tables) {
                this.tables = tables;

                this.setTableActive(tables[0]);
                this.connection().loaded = true;
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
