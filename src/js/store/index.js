import Vue from 'vue'
import Vuex from 'vuex'

import connection from './module/connection.js'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        connection,
    },
})
