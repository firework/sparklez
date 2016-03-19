module.exports = {
    template: require('./../../views/table-database.html'),

    props: [
        'rows',
        'columns',
        'updating',
        'save'
    ],

    data: function() {
        return {
            sort: {
                column: null,
                asc: null,
            },
        }
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
        update: function(row, rowIndex, column, columnIndex) {
            this.updating.row = rowIndex;
            this.updating.column = columnIndex;
            this.updating.type = this.$parent.model.attributes[column].type;
            this.updating.oldVal = row[column];

            if (this.isBigType(column)) {
                this.$parent.modal().open();

                this.$parent.$nextTick(function () {
                    this.$parent.$els.textarea.focus();
                }.bind(this));
            }
        },

        orderBy: function(column) {
            this.sort.asc = this.sort.column == column ? ! this.sort.asc : true;
            this.sort.column = column;
        },

        isUpdating: function(rowIndex, columnIndex) {
            return rowIndex == this.updating.row && columnIndex == this.updating.column;
        },

        isBigType: function(column) {
            return this.$parent.model.attributes[column] ?
                this.$parent.model.attributes[column].type == 'TEXT' :
                false;
        },
    },
};
