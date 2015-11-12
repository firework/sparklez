module.exports = Vue.extend({
	template: view('database'),

	data: function() {
		return {
			tables: [],
			tableActive: null,
			model: null,
			columns: [],
			rows: [],
		};
	},

	methods: {
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
});
