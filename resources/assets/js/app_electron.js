var Vue = require('vue');

// Debug Mode
Vue.config.debug = true;

// Run this on devtools console (not working)
// require('electron').remote.BrowserWindow.addDevToolsExtension('node_modules/vue-devtools/shells/chrome');

var app = new Vue(require('./app'));
