module.exports = Vue.extend({
    template: view('tabs'),

    components: {
        'tab': require(jsDir + '/tab'),
    },

    props: ['tab'],

    data: function() {
        return {
            items: [],
            count: 0,
            active: null,
        }
    },

    methods: {
        add: function() {
            var newTab = 'Tab ' + (++this.count),
                index = this.items.push(newTab);

            this.setActive(index - 1);
        },

        removeAndDisconnect: function(index) {
            if (index == this.active) {
                this.active = null;
            } else {
                this.active > index ? this.active-- : null;
            }

            this.tab.disconnect();

            this.items.$remove(this.items[index]);
        },

        isActive: function(index) {
            return index == this.active;
        },

        setActive: function(index) {
            this.active = index;
        },
    },

    created: function() {
        this.add();
    },
});
