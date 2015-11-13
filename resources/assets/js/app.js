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
			title: 'Servers List',
			tab: null,
		};
	},

	methods: {
		connect: function() {
			if (!this.tab) return;


			this.tab.connect();
		},

		disconnect: function() {
			if (!this.tab) return;

			this.tab.disconnect();
		},

		isConnected: function() {
			return this.tab && this.tab.connection.active;
		}
	},
});
