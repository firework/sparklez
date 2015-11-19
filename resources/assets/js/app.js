var fs = require('fs'),
    Vue = require('vue'),
    rootDir = __dirname + '/..',
    jsDir = rootDir + '/js',
    sequelizeDir = rootDir + '/sequelize',
    viewDir = rootDir + '/views',
    view = require(jsDir + '/view.js');

Vue.config.debug = true;

var app = new Vue({
    el: '#app',

    components: {
        'tabs': require(jsDir + '/tabs'),
    },

    data: function() {
        return {
            loading: false,
            tab: null,
        };
    },

    methods: {
        isConnected: function() {
            return this.tab && this.tab.connection.active;
        }
    },
});
