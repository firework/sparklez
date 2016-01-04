module.exports = Vue.extend({
    template: view('row'),

    components: {
        'column': require(jsDir + '/column'),
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
        name: function() {
            // ...
        },
    },

    created: function() {
        // ...
    },
});
