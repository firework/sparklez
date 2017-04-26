<template>
    <div id="app">
        <div v-if="!connection.active">
            <el-form :model="connection" label-width="120px">
                <el-form-item label="Host">
                    <el-input v-model="connection.host"></el-input>
                </el-form-item>
                <el-form-item label="User">
                    <el-input v-model="connection.user"></el-input>
                </el-form-item>
                <el-form-item label="Password">
                    <el-input v-model="connection.password"></el-input>
                </el-form-item>
                <el-form-item label="Database">
                    <el-input v-model="connection.database"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="connect()">
                        Connect
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
        <el-row v-else>
            <el-col :span="4">
                <el-menu id="menu"
                    @select="setTableActive"
                >
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
                <div class="el-table-wrapper" id="content">
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
                    <el-button
                        type="warning"
                        @click="disconnect()"
                    >Disconnect</el-button>
                    <el-tabs>
                        <el-tab-pane>
                            <span slot="label"><i class="fa fa-table"></i> Content</span>

                            <div class="el-table" id="table">
                                <table class="el-table__body" cellspacing="0" cellpadding="0">
                                    <thead>
                                        <tr>
                                            <th
                                                v-for="column in tableColumns"
                                                :key="column"
                                            >
                                                <div class="cell">{{ column }}</div>
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
                                                v-for="column in tableColumns"
                                                :key="column"
                                            >
                                                <div class="cell">{{ row[column] | str_limit }}</div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="el-table__empty-block"
                                    v-if="tableData.length === 0"
                                >
                                    <span class="el-table__empty-text">No result</span>
                                </div>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane>
                            <span slot="label"><i class="fa fa-terminal"></i> Query</span>
                            <div id="query">
                                <el-input
                                    type="textarea"
                                    :autosize="{ minRows: 10 }"
                                    placeholder="Execute Query"
                                    v-model="query"
                                ></el-input>
                                <br>
                                <br>
                                <el-button
                                    type="primary"
                                    @click="executeQuery()"
                                >Execure Query</el-button>
                                <br>
                                <br>
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
                            <span slot="label"><i class="fa fa-list"></i> Query Log</span>
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
    omit as _omit,
    without as _without,
} from 'lodash'

export default {
    data: () => ({
        connection: {
            host: '127.0.0.1',
            user: 'docker',
            password: 'secret',
            database: 'docker',
            dateStrings: true,
            active: false,
        },
        knex: null,
        query: null,
        queryColumns: [],
        queryData: [],
        databases: [],
        databaseActive: null,
        tables: [],
        tableActive: null,
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
    },

    methods: {
        connect() {
            this.knex = Knex({
                client: 'mysql',
                connection: _.omit(this.connection, 'databsase', 'active'),
            })

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
            this.knex = null
            this.connection.active = false
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
                    this.$message({
                        message: 'Something went wrong.',
                        type: 'error',
                    })
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

            this.loadTableColumns(table)
            this.loadTableData(table)
            this.rowsSelected = []
        },

        loadTableColumns(table) {
            this.knex
                .select('column_name')
                .from('information_schema.columns')
                .where({
                    table_schema: this.databaseActive,
                    table_name: table,
                })
                .pluck('column_name')
                .then(tableColumns => {
                    this.tableColumns = tableColumns
                })
        },

        loadTableData(table) {
            this.prepareQuery(this.databaseActive, table)
                .select('*')
                .then(data => {
                    this.tableData = data
                })
        },

        submitRow(row) {
            let query = this.prepareQuery()

            if (this.rowType == 'update') {
                query.where(this.rowActive).update(this.rowForm)
            } else {
                query.insert(this.rowForm)
            }

            query
                .then(success => {
                    Object.assign(this.rowActive, this.rowForm)

                    this.setRowActive(null)
                    this.$message({
                        message: `Row ${this.rowType}d.`,
                        type: 'success',
                    })

                    if (this.rowType === 'create') {
                        this.loadTable(this.tableActive)
                    }
                })
                .catch(error => {
                    this.setRowActive(null)
                    this.$message({
                        message: 'Something went wrong.',
                        type: 'error',
                    })
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

            this.$message({
                message: `Rows deleted.`,
                type: 'success',
            })

            this.loadTable(this.tableActive)
        },

        prepareQuery(database, table) {
            database = database || this.databaseActive
            table = table || this.tableActive

            return this.knex.withSchema(database).from(table)
        },
    },

    filters: {
        str_limit(value) {
            return value && value.length > 100
                ? value.substring(0, 100).trim() + '...'
                : value
        },
    },
}
</script>

<style>
@import 'https://fonts.googleapis.com/css?family=Roboto:100,400,400i,700';
@import '~font-awesome/css/font-awesome.css';
@import '~highlight.js/styles/github.css';

body {
    font-family: Roboto, sans-serif;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

#menu, #content {
    height: 100vh;
    overflow: auto;
}

.el-table-wrapper {
    padding: 20px;
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
</style>
