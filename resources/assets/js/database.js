module.exports = {
    template: require('./../../views/database.html'),

    components: {
        'table-database': require('./table-database'),
        'modal': require('./components/modal'),
    },

    data: function() {
        return {
            tableActive: null,
            model: {
                attributes: {},
            },
            tables: [],
            columns: [],
            rows: [],
            updating: {
                row: null,
                column: null,
                type: null,
                oldVal: null,
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

            this.loading().start();

            database.getTableInfo({
                table: table,
                id: this.$parent._uid,
            }).then(function(data) {
                var attributes = data.attributes,
                    columns = Object.keys(attributes);

                this.tableActive = null;
                this.columns = [];
                this.rows = [];

                database.getTableData({
                    table: table,
                    attributes: attributes,
                    limit: 50,
                    id: this.$parent._uid,
                }).then(function(data) {
                    this.tableActive = table;
                    this.columns = columns;
                    this.model.attributes = attributes;
                    this.rows = data.rows;
                    this.loading().stop();
                }.bind(this));
            }.bind(this));
        },

        create: function() {
            if (this.connection().loaded) return;

            database.getTables({
                id: this.$parent._uid,
            }).then(function(data) {
                this.tables = data.tables;

                this.setTableActive(data.tables[0]);
                this.connection().loaded = true;
            }.bind(this));
        },

        clearUpdating: function() {
            this.updating.column = null;
            this.updating.row = null;
            this.updating.type = null;
            this.updating.oldVal = null;
        },

        modalClose: function() {
            this.clearUpdating();
            this.modal().close();
        },

        save: function() {
            if (this.updating.column === null || this.updating.saving === true) return;

            var newVal = this.rows[this.updating.row][this.columns[this.updating.column]];

            // Check any changes
            if (newVal == this.updating.oldVal) {
                this.clearUpdating();
                return;
            }

            this.updating.saving = true;
            this.loading().start();

            // Create params for update
            var values = {},
                options = {};

            // Get column name
            var column = this.columns[this.updating.column];
            values[column] = newVal;

            // Get row
            var row = this.rows[this.updating.row];
            options.where = row;

            // TODO: create the update function on app.js (server)
            // this.model.update(values, options).then(function(results) {
                if (this.modal().isActive()) {
                    this.modal().close();
                };

                this.rows[this.updating.row][column] = newVal;
                this.clearUpdating();
                this.updating.saving = false;

                this.loading().stop();
            // }.bind(this));
        },
    },
};
