import Knex from 'knex'

export default {
    namespaced: true,

    state: {
        knex: null,
        connection: {
            name: '',
            host: '',
            port: '',
            user: '',
            password: '',
            database: '',
            dateStrings: true,
            active: false,
            tested: false,
        },
        databaseActive: null,
        tableActive: null,
        tableCount: 0,
        tableColumns: [],
        tableData: [],
        queryLog: [],
    },

    getters: {
        knex: state => state.knex,
        connection: state => state.connection,
        databaseActive: state => state.databaseActive,
        tableActive: state => state.tableActive,
        tableCount: state => state.tableCount,
        tableColumns: state => state.tableColumns,
        tableData: state => state.tableData,
        queryLog: state => state.queryLog,
    },

    actions: {
        setKnex({ commit }, payload) {
            commit('SET_KNEX', payload)
        },

        setConnection({ commit }, payload) {
            commit('SET_CONNECTION', payload)
        },

        setDatabaseActive({ commit }, payload) {
            commit('SET_DATABASE_ACTIVE', payload)
        },

        setTableActive({ commit }, payload) {
            commit('SET_TABLE_ACTIVE', payload)
        },

        setTableCount({ commit }, payload) {
            commit('SET_TABLE_COUNT', payload)
        },

        setTableColumns({ commit }, payload) {
            commit('SET_TABLE_COLUMNS', payload)
        },

        setTableData({ commit }, payload) {
            commit('SET_TABLE_DATA', payload)
        },

        setQueryLog({ commit }, payload) {
            commit('SET_QUERY_LOG', payload)
        },

        updatePropertyConnection({ commit }, payload) {
            commit('UPDATE_CONNECTION_PROPERTY', payload)
        },

        resetConnectionState({ commit }) {
            commit('RESET_CONNECTION_STATE')
        },
    },

    mutations: {
        SET_KNEX(state, payload) {
            state.knex = payload
        },

        SET_CONNECTION(state, payload) {
            state.connection = payload
        },

        SET_DATABASE_ACTIVE(state, payload) {
            state.databaseActive = payload
        },

        SET_TABLE_ACTIVE(state, payload) {
            state.tableActive = payload
        },

        SET_TABLE_COUNT(state, payload) {
            state.tableCount = payload
        },

        SET_TABLE_COLUMNS(state, payload) {
            state.tableColumns = payload
        },

        SET_TABLE_DATA(state, payload) {
            state.tableData = payload
        },

        SET_QUERY_LOG(state, payload) {
            state.queryLog.push(payload)
        },

        UPDATE_CONNECTION_PROPERTY(state, payload) {
            state.connection[payload.property] = payload.value
        },

        RESET_CONNECTION_STATE(state) {
            state.tableActive = null
            state.databaseActive = null
            state.tableColumns = []
            state.tableData = []
            state.queryLog = []
        },
    },
}
