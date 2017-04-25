import Vue from 'vue'
import VueHighlightJS from 'vue-highlightjs'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import App from '~/App.vue'

Vue.use(ElementUI)
Vue.use(VueHighlightJS)

new Vue({
    el: '#app',
    render: h => h(App),
})
