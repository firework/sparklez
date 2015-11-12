module.exports = Vue.extend({
	template: view('connection'),

	props: ['connection'],

	methods: {
		connect: function() {
			this.connection.active = !this.connection.active;
		},
	},
});
