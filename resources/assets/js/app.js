var fs = require('fs'),
	Vue = require('vue'),
	Sequelize = require('sequelize'),
	SequelizeAuto = require('sequelize-auto'),
	sequelize = new Sequelize('mysql://homestead:secret@localhost:33060/homestead'),
	sequelizeAuto = new SequelizeAuto('homestead', 'homestead', 'secret', {
		host: 'localhost',
		port: 33060,
	}),
	sequelizeDir = __dirname + '/../sequelize';

Vue.config.debug = true;

var app = new Vue({
	el: '#app',

	data: {
		tabs: [],
		tabsCount: 0,
		tabActive: null,
		tables: [],
		tableActive: null,
		model: null,
		columns: [],
		rows: [],
	},

	methods: {
		addTab: function(tab) {
			var newTab = 'Tab ' + (++this.tabsCount);

			this.tabs.push(newTab);

			this.setTabActive(newTab);
		},

		removeTab: function(index) {
			this.tabs.splice(index, 1);
		},

		isTabActive: function(tab) {
			return tab == this.tabActive;
		},

		setTabActive: function(tab) {
			this.tabActive = tab;
		},

		isTableActive: function(table) {
			return table == this.tableActive;
		},

		setTableActive: function(table) {
			this.model = require(sequelizeDir + '/' + table)(sequelize, Sequelize);

			var that = this,
				columns = Object.keys(this.model.attributes);

			that.model.findAll({
				attributes: columns, // this.columns,
			}).then(function(result) {
				var rows = [];

				for (x in result) {
					rows.push(result[x].dataValues);
				}

				that.tableActive = table;
				that.columns = columns;
				that.rows = rows;
			});
		},
	},

	created: function() {
		var that = this;

		this.addTab();

		sequelizeAuto.run({
			spaces: true,
			indentation: 4,
			directory: sequelizeDir,
		    additional: {
		        timestamps: false,
		    }
		}, function(err){
			if (err) throw err;

			fs.readdir(sequelizeDir, function(err, files) {
				for (x in files) {
					files[x] = files[x].replace('.js', '');
				}

				that.tables = files;
				that.setTableActive(files[0]);
			});
		});

	},
})
