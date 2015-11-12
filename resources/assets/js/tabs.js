module.exports = Vue.extend({
	template: view('tabs'),

	data: function() {
		return {
			tabs: [],
			tabsCount: 0,
			tabActive: null,
		}
	},

	methods: {
		addTab: function(tab) {
			var newTab = 'Tab ' + (++this.tabsCount);

			this.tabs.push(newTab);

			this.setTabActive(newTab);
		},

		removeTab: function(index) {
			if (this.tabs[index] == this.tabActive) {
				this.tabActive = null;
			}

			this.tabs.splice(index, 1);
		},

		isTabActive: function(tab) {
			return tab == this.tabActive;
		},

		setTabActive: function(tab) {
			this.tabActive = tab;
		},
	},

	created: function() {
		this.addTab();
	},
});
