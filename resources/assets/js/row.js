module.exports = {
    template: require('./../../views/row.html'),

    components: {
        'column': require('./column'),
    },

    props: [
        'row',
        'rowIndex',
    ],

    computed: {
        columns: function() {
            return this.$parent.columns;
        },

        updating: function() {
            return this.$parent.updating;
        },

        model: function() {
            return this.$parent.model;
        },
    },

    methods: {
        modal: function() {
            return this.$parent.modal();
        },

        save: function() {
            return this.$parent.save();
        }
    },
};
