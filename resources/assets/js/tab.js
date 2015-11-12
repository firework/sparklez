module.exports = Vue.extend({
	template: view('tab'),

	components: {
		'connection': require(jsDir + '/connection'),
		'database': require(jsDir + '/database'),
	},

	data: function() {
		return {
			connection: {
				active: false,
			},
		};
	},

	methods: {
		connect: function() {
			this.connection.active = !this.connection.active;
		},
	},


});
