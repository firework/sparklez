var fs = require('fs'),
    Vue = require('vue'),
    rootDir = __dirname + '/..',
    jsDir = rootDir + '/js',
    sequelizeDir = rootDir + '/sequelize',
    viewDir = rootDir + '/views',
    view = require(jsDir + '/view.js');

// Debug Mode
Vue.config.debug = true;
// Run this on devtools console (not working)
// require('electron').remote.BrowserWindow.addDevToolsExtension('node_modules/vue-devtools/shells/chrome');

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
