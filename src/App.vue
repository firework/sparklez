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
                    <div class="el-table">
                        <table cellspacing="0" cellpadding="0">
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
                                    @click="setRowActive(row)"
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
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import Knex from 'knex'
import { clone as _clone } from 'lodash'

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

        setRowActive(row) {
            this.rowActive = row
            this.rowForm = _clone(row)
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

        this.loadDatabases()
    },
}
</script>

<style>
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
