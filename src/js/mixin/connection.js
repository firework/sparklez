import { mapGetters, mapActions } from 'vuex'

export default {
    computed: mapGetters('connection', [
        'knex',
        'connection',
        'databaseActive',
        'tableActive',
        'tableCount',
        'tableColumns',
        'tableData',
        'queryLog',
    ]),

    methods: mapActions('connection', [
        'setKnex',
        'setConnection',
        'setDatabaseActive',
        'setTableActive',
        'setTableCount',
        'setTableColumns',
        'setTableData',
        'setQueryLog',
        'updatePropertyConnection',
        'resetConnectionState',
    ]),
}