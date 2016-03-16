var Vue = require('vue');

Vue.use(require('vue-resource'));

// Debug Mode
Vue.config.debug = true;

// Run this on devtools console (not working)
// require('electron').remote.BrowserWindow.addDevToolsExtension('node_modules/vue-devtools/shells/chrome');

var app = new Vue({
    el: '#app',

    components: {
        'tabs': require('./tabs'),
    },

    data: function() {
        return {
            tab: null,
        };
    },

    methods: {
        isConnected: function() {
            return this.tab && this.tab.connection.active;
        }
    },
});
