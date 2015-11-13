module.exports = Vue.extend({
	template: view('tab'),

	components: {
		'connection': require(jsDir + '/connection'),
		'database': require(jsDir + '/database'),
	},

	props: ['tab', 'name', 'active'],

	data: function() {
		return {
			connection: {
				active: false,
			},
		};
	},

	methods: {
		connect: function() {
			this.connection.active = true;
		},

		disconnect: function() {
			this.connection.active = false;
		},

		isConnected: function() {
			if (this.active) this.tab = this;

			return this.active && this.connection.active;
		},

		isNotConnected: function() {
			return this.active && !this.connection.active;
		},
	},
});
