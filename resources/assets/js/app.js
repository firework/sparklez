var fs = require('fs'),
	Vue = require('vue'),
	Sequelize = require('sequelize'),
	SequelizeAuto = require('sequelize-auto'),
	sequelize = new Sequelize('mysql://homestead:secret@localhost:33060/homestead'),
	sequelizeAuto = new SequelizeAuto('homestead', 'homestead', 'secret', {
		host: 'localhost',
		port: 33060,
	}),
	rootDir = __dirname + '/..',
	jsDir = rootDir + '/js',
	sequelizeDir = rootDir + '/sequelize',
	viewDir = rootDir + '/views',
	view = require(jsDir + '/view.js')
;

Vue.config.debug = true;

var app = new Vue({
	el: '#app',

	components: {
		'connection': require(jsDir + '/connection'),
		'database': require(jsDir + '/database'),
		'tabs': require(jsDir + '/tabs'),
	},

	data: {
		connection: {
			active: false,
		},
	},

	methods: {
		connect: function() {
			this.connection.active = !this.connection.active;
		},
	},

	created: function() {

	},
})
