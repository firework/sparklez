import Vue from 'vue'
import lodash from 'lodash'
import VueLodash from 'vue-lodash'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import ElementTheme from 'element-theme-default'
import locale from 'element-ui/lib/locale/lang/en'
import highlightjs from 'highlight.js'
import App from '~/App.vue'
import store from './store'
import filters from './filter'

Vue.use(ElementUI, { locale })
Vue.use(ElementTheme)
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

Vue.directive('resize', {
    componentUpdated: function (el) {
        let thead, startOffset;
        let ths = el.tHead.rows[0].cells;

        if (ths) {
            Array.prototype.forEach.call(ths, th => {
                th.style.position = 'relative';

                let grip = document.createElement('div');
                grip.classList.add('resizeTable');

                grip.addEventListener('mousedown', function (e) {
                    thead = th;
                    startOffset = th.offsetWidth - e.pageX;

                    document.addEventListener('mousemove', function (e) {
                        if(thead) {
                            thead.style.width = startOffset + e.pageX + 'px';
                        }
                    })
                })

                th.appendChild(grip);
            })

            document.addEventListener('mouseup', function () {
                thead = undefined;
            })
        }
    }
})

new Vue({
    el: '#app',
    store,
    render: h => h(App),
})
