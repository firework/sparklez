import Vue from 'vue'
import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import highlightjs from 'highlight.js'
import App from '~/App.vue'
import store from './store'
import filters from './filter'

// styles
import '~/css/theme/index.css'
import 'font-awesome/css/font-awesome.css'
import 'highlight.js/styles/github.css'

Vue.use(ElementUI, { locale })
Vue.use(filters)

Vue.directive('highlightjs', {
    deep: true,
    
    bind: function bind(el, binding) {
        // on first bind, highlight all targets
        const targets = el.querySelectorAll('code')
        for (let i = 0; i < targets.length; i += 1) {
            const target = targets[i]

            if (binding.value) {
                // if a value is directly assigned to the directive, use this
                // instead of the element content.
                target.textContent = binding.value
            }

            highlightjs.highlightBlock(target)
        }
    },

    componentUpdated: function componentUpdated(el, binding) {
        // after an update, re-fill the content and then highlight
        const targets = el.querySelectorAll('code')

        for (let i = 0; i < targets.length; i += 1) {
            const target = targets[i]
            if (binding.value) {
                target.textContent = binding.value
                highlightjs.highlightBlock(target)
            }
        }
    },
})

new Vue({
    el: '#app',
    store,
    render: h => h(App),
})
