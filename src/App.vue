<template>
    <div id="app">
        <el-row>
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
    without as _without,
} from 'lodash'

export default {
    data: () => ({
        knex: null,
        databases: [],
        databaseActive: null,
        databaseDefault: 'docker',
        tables: [],
        tableActive: null,
        tableColumns: [],
        tableData: [],
        tableFilter: '',
        rowActive: null,
        rowForm: null,
        rowSelectTimeout: null,
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

        openRow(row) {
            this.setRowActive(row)
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
                    this.setDatabaseActive(this.databaseDefault)
                })
        },

        loadTables(database) {
            this.knex
                .select('table_name')
                .from('information_schema.tables')
                .where({ table_schema: database })
                .pluck('table_name')
                .then(tables => {
                    this.tables = tables
                    this.loadTable(tables[0])
                })
        },

        loadTable(table) {
            this.loadTableColumns(table)
            this.loadTableData(table)
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
            this.knex
                .withSchema(this.databaseActive)
                .select('*')
                .from(table)
                .then(data => {
                    this.tableData = data
                })
        },

        submitRow(row) {
            this.knex
                .withSchema(this.databaseActive)
                .from(this.tableActive)
                .where(this.rowActive)
                .update(this.rowForm)
                .then(success => {
                    Object.assign(this.rowActive, this.rowForm)

                    this.setRowActive(null)
                    this.$message({
                        message: 'Row updated.',
                        type: 'success',
                    })
                })
                .catch(error => {
                    this.setRowActive(null)
                    this.$message({
                        message: 'Something went wrong.',
                        type: 'error',
                    })
                })
        },
    },

    filters: {
        str_limit(value) {
            return value && value.length > 100
                ? value.substring(0, 100).trim() + '...'
                : value
        },
    },

    mounted() {
        this.knex = Knex({
            client: 'mysql',
            connection: {
                host: '127.0.0.1',
                user: 'docker',
                password: 'secret',
                dateStrings: true,
            },
        })

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
</style>
