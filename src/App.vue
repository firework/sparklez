<template>
    <div id="app">
        <div v-if="!connection.active">
            <el-row :gutter="20">
                <el-col :sm="6" :lg="4">
                    <div class="sidebar">
                        <el-menu mode="vertical">
                            <el-menu-item
                                v-for="(favorite, key) in favorites"
                                :key="key"
                                :index="key + ''"
                                @click="setFavorite(favorite)"
                            >
                                <i class="fa fa-fw fa-database"></i>
                                <span v-text="favorite.name"></span>
                                <i class="fa fa-fw fa-times" @click.stop="removeFavorite(key)"></i>
                            </el-menu-item>

                            <!-- @TODO: folder feature -->
                            <!-- <el-submenu index="2">
                                <template slot="title"><i class="fa fa-fw fa-folder"></i> Development</template>
                                <el-menu-item index="2-1"><i class="fa fa-fw fa-database"></i> localhost</el-menu-item>
                            </el-submenu> -->
                        </el-menu>
                    </div>
                </el-col>

                <el-col :sm="{span: 12, offset: 3}" :lg="{span: 10, offset: 5}">
                    <h2>Connection</h2>

                    <el-form :model="connection">
                        <el-form-item>
                            <el-input placeholder="localhost" v-model="connection.name">
                                <template slot="prepend"><i class="fa fa-fw fa-tag"></i> Name</template>
                            </el-input>
                        </el-form-item>

                        <el-form-item>
                            <el-input placeholder="127.0.0.1" v-model="connection.host">
                                <template slot="prepend"><i class="fa fa-fw fa-server"></i> Host</template>
                            </el-input>
                        </el-form-item>

                        <el-form-item>
                            <el-input placeholder="3306" v-model="connection.port">
                                <template slot="prepend"><i class="fa fa-fw fa-random"></i> Port</template>
                            </el-input>
                        </el-form-item>

                        <el-form-item>
                            <el-input placeholder="root" v-model="connection.user">
                                <template slot="prepend"><i class="fa fa-fw fa-user"></i> User</template>
                            </el-input>
                        </el-form-item>

                        <el-form-item>
                            <el-input placeholder="secret" v-model="connection.password">
                                <template slot="prepend"><i class="fa fa-fw fa-lock"></i> Password</template>
                            </el-input>
                        </el-form-item>

                        <el-form-item>
                            <el-input placeholder="development" v-model="connection.database">
                                <template slot="prepend"><i class="fa fa-fw fa-database"></i> Database</template>
                            </el-input>
                        </el-form-item>

                        <el-form-item>
                            <el-button-group>
                                <el-button type="primary" @click="saveAsFavorite()" :disabled="!hasConnectionData"><i class="fa fa-fw fa-star"></i> Save as favorite</el-button>
                                <el-button type="primary" @click="testConnection()" :disabled="!hasConnectionData"><i class="fa fa-fw fa-bolt"></i> Test connection</el-button>
                                <el-button type="primary" @click="connect()" :disabled="!hasConnectionData"><i class="fa fa-fw fa-plug"></i> Connect</el-button>
                            </el-button-group>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>

        <el-row v-else>
            <el-col :span="4">
                <el-menu class="has-full-height" @select="setTableActive">
                    <li class="el-menu-item">
                        <el-select
                            v-model="databaseActive"
                            @change="loadTables"
                            filterable
                            placeholder="Select database"
                        >
                            <el-option
                                v-for="database in databases"
                                :key="database"
                                :label="database"
                                :value="database"
                            ></el-option>
                        </el-select>
                    </li>
                    <li class="el-menu-item">
                        <el-input
                            v-model="tableFilter"
                            placeholder="Filter"
                        ></el-input>
                    </li>
                    <el-menu-item
                        v-for="table in tablesFiltered"
                        :key="table"
                        :index="table"
                        v-text="table"
                    ></el-menu-item>
                </el-menu>
            </el-col>

            <el-col :span="20">
                <div class="content">
                    <el-button-group>
                        <el-button
                            type="primary"
                            icon="plus"
                            @click="createRow()"
                        >Create</el-button>

                        <el-button
                            type="primary"
                            icon="edit"
                            :disabled="rowsSelected.length !== 1"
                            @click="openRow(tableData[rowsSelected[0]])"
                        >Edit</el-button>

                        <el-button
                            type="primary"
                            icon="delete"
                            :disabled="rowsSelected.length === 0"
                            @click="deleteRows()"
                        >Delete</el-button>
                    </el-button-group>

                    <el-button type="info" @click="loadTable()"><i class="fa fa-fw fa-refresh"></i> Refresh</el-button>

                    <el-button type="warning" @click="disconnect()"><i class="fa fa-fw fa-power-off"></i> Disconnect</el-button>

                    <!-- hue --> <br><br>

                    <el-tabs>
                        <el-tab-pane>
                            <span slot="label"><i class="fa fa-fw fa-file-text"></i> Content</span>

                            <el-form :inline="true" :model="filter">
                                <el-form-item>
                                    <el-select v-model="filter.column" placeholder="Column">
                                        <el-option
                                            v-for="(column, key) in tableColumns"
                                            :key="key"
                                            :label="column.column_name"
                                            :value="column.column_name"
                                        ></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item>
                                    <el-select v-model="filter.operator" placeholder="Operator">
                                        <el-option
                                            v-for="(filter, key) in filter.operators"
                                            :key="key"
                                            :label="filter"
                                            :value="filter"
                                        ></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item>
                                    <el-input v-model="filter.value" placeholder="Value"></el-input>
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="primary" @click="loadTableData()">Filter</el-button>
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="warning" @click="resetFilterAndReload()">Filter</el-button>
                                </el-form-item>
                            </el-form>

                            <div id="table-content">
                                <el-pagination
                                    layout="sizes, total, prev, pager, next, jumper"
                                    :page-sizes="paginateSizes"
                                    :page-size="paginateNumber"
                                    :total="tableCount"
                                    @size-change="setPaginateNumber($event)"
                                    @current-change="setPaginatePage($event)"
                                ></el-pagination>
                                <br>
                                <div class="el-table">
                                    <table class="el-table__body" cellspacing="0" cellpadding="0">
                                        <thead>
                                            <tr>
                                                <th v-for="(column, key) in tableColumns" :key="key">
                                                    <div class="cell" v-text="column.column_name"></div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr
                                                v-for="(row, key) in tableData"
                                                :key="key"
                                                :class="{'current-row': isRowSelected(key)}"
                                                @dblclick="openRow(row)"
                                                @click="toggleRow(key)"
                                            >
                                                <td
                                                    v-for="(column, key) in tableColumns"
                                                    :key="key"
                                                >
                                                    <div class="cell">{{ row[column.column_name] | str_limit }}</div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div class="el-table__empty-block" v-if="tableData.length === 0">
                                        <span class="el-table__empty-text">No result</span>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane>
                            <span slot="label"><i class="fa fa-fw fa-table"></i> Structure</span>
                            <div id="structure">
                                <div class="el-table">
                                    <table class="el-table__body" cellspacing="0" cellpadding="0">
                                        <thead>
                                            <tr>
                                                <th><div class="cell">Field</div></th>
                                                <th><div class="cell">Type</div></th>
                                                <th><div class="cell">Length</div></th>
                                                <th><div class="cell">Unsigned</div></th>
                                                <th><div class="cell">Zerofill</div></th>
                                                <th><div class="cell">Nullable</div></th>
                                                <th><div class="cell">Key</div></th>
                                                <th><div class="cell">Default</div></th>
                                                <th><div class="cell">Extra</div></th>
                                                <th><div class="cell">Comment</div></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr
                                                v-for="(row, key) in tableColumns"
                                                :key="key"
                                            >
                                                <td><div class="cell" v-text="row.column_name"></div></td>
                                                <td><div class="cell" v-text="row.data_type"></div></td>
                                                <td><div class="cell" v-text="getColumnLength(row.column_type)"></div></td>
                                                <td><div class="cell"><i class="fa fa-fw" :class="{
                                                    'fa-check-square-o': isColumnUnsigned(row.column_type),
                                                    'fa-square-o': !isColumnUnsigned(row.column_type),
                                                }"></i></div></td>
                                                <td><div class="cell"><i class="fa fa-fw" :class="{
                                                    'fa-check-square-o': isColumnZerofill(row.column_type),
                                                    'fa-square-o': !isColumnZerofill(row.column_type),
                                                }"></i></div></td>
                                                <td><div class="cell"><i class="fa fa-fw" :class="{
                                                    'fa-check-square-o': isColumnNullable(row.is_nullable),
                                                    'fa-square-o': !isColumnNullable(row.is_nullable),
                                                }"></i></div></td>
                                                <td><div class="cell" v-text="row.column_key"></div></td>
                                                <td><div class="cell" v-text="row.column_default"></div></td>
                                                <td><div class="cell" v-text="row.extra"></div></td>
                                                <td><div class="cell" v-text="row.column_comment"></div></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane>
                            <span slot="label"><i class="fa fa-fw fa-terminal"></i> Query</span>
                            <div id="query">
                                <el-form>
                                    <el-form-item>
                                        <el-input
                                            type="textarea"
                                            :autosize="{ minRows: 10 }"
                                            placeholder="Execute Query"
                                            v-model="query"
                                        ></el-input>
                                    </el-form-item>

                                    <el-form-item>
                                        <el-button type="primary" @click="executeQuery()">Execute Query</el-button>
                                    </el-form-item>
                                </el-form>

                                <div class="el-table">
                                    <table class="el-table__body" cellspacing="0" cellpadding="0">
                                        <thead>
                                            <tr>
                                                <th
                                                    v-for="column in queryColumns"
                                                    :key="column"
                                                >
                                                    <div class="cell">{{ column }}</div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr
                                                v-for="(row, key) in queryData"
                                                :key="key"
                                            >
                                                <td
                                                    v-for="column in queryColumns"
                                                    :key="column"
                                                >
                                                    <div class="cell">{{ row[column] | str_limit }}</div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div class="el-table__empty-block"
                                        v-if="queryData.length === 0"
                                    >
                                        <span class="el-table__empty-text">No result</span>
                                    </div>
                                </div>
                            </div>

                        </el-tab-pane>
                        <el-tab-pane>
                            <span slot="label"><i class="fa fa-fw fa-list"></i> Query Log</span>
                            <div class="el-table" id="query-log">
                                <table class="el-table__body" cellspacing="0" cellpadding="0">
                                    <thead>
                                        <tr>
                                            <th><div>Ran At</div></th>
                                            <th><div>Query</div></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="(query, key) in queryLog"
                                            :key="key"
                                        >
                                            <td>
                                                <div class="cell">{{ query.ranAt.toLocaleString() }}</div>
                                            </td>
                                            <td>
                                                <div class="cell">
                                                    <pre v-highlightjs="query.sql"><code class="sql"></code></pre>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
                <el-dialog
                    v-model="hasRowActive"
                    title="Edit Row"
                    @close="setRowActive(null)"
                >
                    <el-form
                        v-if="hasRowActive"
                        :model="rowForm"
                    >
                        <el-form-item
                            v-for="column in tableColumns"
                            :key="column"
                            :label="column">
                            <el-input
                                v-model="rowForm[column]"
                            ></el-input>
                        </el-form-item>
                    </el-form>
                    <div slot="footer" class="dialog-footer">
                        <el-button @click="setRowActive(null)">Cancel</el-button>
                        <el-button type="primary" @click="submitRow(rowActive)">Confirm</el-button>
                    </div>
                </el-dialog>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import Knex from 'knex'
import {
    clone as _clone,
    isNull as _isNull,
    isNumber as _isNumber,
    mapKeys as _mapKeys,
    omit as _omit,
    without as _without,
} from 'lodash'

export default {
    data: () => ({
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
        filter: {
            column: null,
            operator: null,
            value: null,
            operators: [
                '=',
                '!=',
                '>',
                '<',
                '>=',
                '<=',
                // @TODO: implement these filters
                // 'IN',
                // 'LIKE',
                // 'IS NULL',
                // 'IS NOT NULL',
            ],
        },
        paginateSizes: [1, 50, 100, 200, 300, 400, 500, 1000],
        paginateNumber: 50,
        paginatePage: 1,
        favorites: [],
        knex: null,
        query: null,
        queryColumns: [],
        queryData: [],
        databases: [],
        databaseActive: null,
        tables: [],
        tableActive: null,
        tableCount: 0,
        tableColumns: [],
        tableData: [],
        tableFilter: '',
        rowActive: null,
        rowForm: null,
        rowType: 'update',
        rowsSelected: [],
        queryLog: [],
    }),

    computed: {
        tablesFiltered() {
            return this.tables.filter(table => {
                return (
                    !this.tableFilter || table.indexOf(this.tableFilter) !== -1
                )
            })
        },

        hasRowActive() {
            return !!this.rowActive
        },

        hasConnectionData() {
            return (
                !!this.connection.name &&
                !!this.connection.host &&
                !!this.connection.port &&
                !!this.connection.user &&
                !!this.connection.password
            )
        },
    },

    watch: {
        // TODO: reactivity problem
        // connection: {
        //     handler(connection) {
        //         this.knex = null
        //         connection.tested = false
        //
        //         return connection
        //     },
        //     deep: true,
        // },

        favorites(favorites) {
            localStorage.setItem('favorites', JSON.stringify(favorites))

            return favorites
        },
    },

    methods: {
        // TODO: put on global functions
        rawMessage(message, type) {
            this.$message({
                showClose: true,
                message,
                type,
            })
        },

        successMessage(message = 'No message') {
            this.rawMessage(message, 'success')
        },

        warningMessage(message = 'No message') {
            this.rawMessage(message, 'warning')
        },

        errorMessage(message = 'No message') {
            this.rawMessage(message, 'error')
        },

        saveAsFavorite() {
            this.favorites.push(
                _.omit(this.connection, 'dateStrings', 'active', 'tested')
            )
            this.successMessage('Connection added on favorites.')
        },

        // @TODO: check connection.favorite === true to disable favorite button
        setFavorite(favorite) {
            for (let key in favorite) {
                this.connection[key] = favorite[key]
            }
        },

        removeFavorite(key) {
            this.favorites.splice(key, 1)
        },

        getKnex() {
            return Knex({
                client: 'mysql',
                connection: _.omit(this.connection, 'active'),
            })
        },

        // TODO: think a better way to test connection
        testConnection() {
            let knex = this.getKnex()

            knex
                .raw('select 1+1 as result')
                .then(() => {
                    this.connection.tested = true
                    this.knex = knex
                    this.successMessage('Connection accepted.')
                })
                .catch(error => {
                    this.connection.tested = false
                    this.errorMessage('Connection refused.')
                    console.error(error)
                })
        },

        connect() {
            this.knex = this.knex || this.getKnex()
            this.connection.active = true

            this.knex.on('query', data => {
                // pluck are the internal queries to get databases, tables and columns
                if (data.method === 'pluck') return

                let index = 0

                this.queryLog.unshift({
                    ranAt: new Date(),
                    sql: data.sql.replace(/\?/g, () => {
                        let value = data.bindings[index++]

                        return _isNumber(value) || _isNull(value)
                            ? value
                            : `'${value}'`
                    }),
                })
            })

            this.loadDatabases()
        },

        disconnect() {
            this.connection.active = false
            this.connection.tested = false
            this.knex = null

            this.resetData()
        },

        resetData() {
            this.paginateNumber = 50
            this.paginatePage = 1
            this.tableActive = null
            this.databaseActive = null
            this.rowActive = null
            this.query = null
            this.queryColumns = []
            this.queryData = []
            this.queryLog = []
            this.tableColumns = []
            this.tableData = []
        },

        resetFilter() {
            this.filter.column = null
            this.filter.operator = null
            this.filter.value = null
        },

        resetFilterAndReload() {
            this.resetFilter()
            this.loadTableData()
        },

        executeQuery() {
            this.knex
                .raw(this.query)
                .then(result => {
                    // MySQL resturns and array and the first key has the result
                    result = result[0]

                    if (result.length) {
                        this.queryColumns = Object.keys(result[0])
                        this.queryData = result
                    } else {
                        this.queryColumns = []
                        this.queryData = []
                    }
                })
                .catch(error => {
                    this.errorMessage('Something went wrong.')
                    console.error(error)
                })
        },

        setTableActive(table) {
            if (table === this.tableActive) return

            this.tableActive = table
            this.loadTable(table)
        },

        setDatabaseActive(database) {
            this.databaseActive = database
        },

        toggleRow(rowKey) {
            if (this.isRowSelected(rowKey)) {
                this.rowsSelected = _without(this.rowsSelected, rowKey)
            } else {
                this.rowsSelected.push(rowKey)
            }
        },

        openRow(row, type = 'update') {
            this.setRowActive(row)
            this.rowType = type
        },

        setRowActive(row) {
            this.rowActive = row
            this.rowForm = _clone(row)
        },

        isRowSelected(key) {
            return this.rowsSelected.includes(key)
        },

        loadDatabases() {
            this.knex
                .select('table_schema')
                .from('information_schema.tables')
                .groupBy('table_schema')
                .pluck('table_schema')
                .then(databases => {
                    this.databases = databases
                    this.setDatabaseActive(this.connection.database)
                })
        },

        loadTables(database) {
            database = database || this.databaseActive

            this.knex
                .select('table_name')
                .from('information_schema.tables')
                .where({ table_schema: database })
                .pluck('table_name')
                .then(tables => {
                    this.tables = tables
                    this.setTableActive(tables[0])
                })
        },

        loadTable(table) {
            table = table || this.tableActive

            this.rowsSelected = []
            this.resetFilter()

            this.loadTableCount(table)
            this.loadTableColumns(table)
            this.loadTableData(table)
        },

        loadTableCount(table) {
            this.prepareQuery(this.databaseActive, table)
                .count()
                .then(result => {
                    result = result[0]

                    this.tableCount = result['count(*)']
                })
        },

        loadTableColumns(table) {
            this.knex
                .select('*')
                .from('information_schema.columns')
                .where({
                    table_schema: this.databaseActive,
                    table_name: table,
                })
                .then(result => {
                    this.tableColumns = result.map(row =>
                        _mapKeys(row, (value, key) => key.toLowerCase())
                    )
                })
        },

        loadTableData(table) {
            this.prepareQueryWithFilters(this.databaseActive, table)
                .select('*')
                .limit(this.paginateNumber)
                .offset(this.paginateNumber * (this.paginatePage - 1))
                .then(data => {
                    this.tableData = data
                })
        },

        submitRow(row) {
            let query = this.prepareQuery()

            this.rowType == 'update'
                ? query.where(this.rowActive).update(this.rowForm)
                : query.insert(this.rowForm)

            query
                .then(success => {
                    Object.assign(this.rowActive, this.rowForm)

                    this.setRowActive(null)
                    this.successMessage(`Row ${this.rowType}d.`)

                    if (this.rowType === 'create') {
                        this.loadTable(this.tableActive)
                    }
                })
                .catch(error => {
                    this.setRowActive(null)
                    this.errorMessage('Something went wrong.')
                    console.error(error)
                })
        },

        createRow() {
            let row = {}

            this.tableColumns.forEach(column => {
                row[column] = null
            })

            this.openRow(row, 'create')
        },

        deleteRows(rowsSelected) {
            rowsSelected = rowsSelected || this.rowsSelected

            rowsSelected.forEach(rowKey => {
                let row = this.tableData[rowKey]

                this.prepareQuery()
                    .where(row)
                    .delete()
                    .then(result => {
                        // nothing to do here
                    })
                    .catch(error => {
                        console.error(error)
                    })
            })

            this.successMessage('Row(s) deleted.')
            this.loadTable(this.tableActive)
        },

        prepareQuery(database, table) {
            database = database || this.databaseActive
            table = table || this.tableActive

            return this.knex.withSchema(database).from(table)
        },

        prepareQueryWithFilters(database, table) {
            let query = this.prepareQuery()

            if (
                !this.filter.column ||
                !this.filter.operator ||
                !this.filter.value
            ) {
                return query
            }

            return query.where(
                this.filter.column,
                this.filter.operator,
                this.filter.value
            )
        },

        setPaginateNumber(number) {
            this.paginateNumber = number
            this.loadTable()
        },

        setPaginatePage(page) {
            this.paginatePage = page
            this.loadTable()
        },

        getColumnLength(type) {
            let match = new RegExp(/(.+)\(([0-9]+)\)(.+)?/).exec(type)

            if (match) return match[2]
        },

        isColumnUnsigned(type) {
            return type.indexOf('unsigned') !== -1
        },

        isColumnZerofill(type) {
            return type.indexOf('zerofill') !== -1
        },

        isColumnNullable(isNullable) {
            return isNullable === 'YES'
        },
    },

    filters: {
        str_limit(value) {
            return value && value.length > 100
                ? value.substring(0, 100).trim() + '...'
                : value
        },
    },

    created() {
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || []
    },
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto:100,400,400i,700');

body {
    font-family: 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

.content {
    padding: 20px;
}

.has-full-height {
    height: 100vh;
    overflow: auto;
    box-sizing: border-box;
}

.sidebar {
    @extend .has-full-height;
    background-color: #eef1f6;
}

.el-select {
    width: 100%;
}

.el-table {
    min-width: 100%;
    max-width: none;
    overflow: auto;
    width: auto;
}

.el-table::after, .el-table::before {
    display: none;
}

.el-table table {
    border: 0;
    min-width: 100%;
}

.el-table th > .cell {
    white-space: nowrap;
}

.el-table td > .cell {
    word-break: normal;
}

.paginate {
    width: auto !important;
}

.fa-check-square-o {
    margin-left: 2px;
}
</style>
