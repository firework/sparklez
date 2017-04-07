<template>
    <div id="app">
        <el-row>
            <el-col :span="4">
                <el-menu>
                    <el-menu-item
                        :index="tableFilter"
                    >
                        <el-input
                            v-model="tableFilter"
                            placeholder="Filter"
                        ></el-input>
                    </el-menu-item>
                    <el-menu-item
                        v-for="table in tablesFiltered"
                        :key="table"
                        :index="table"
                        v-text="table"
                        @click="setTableActive(table)"
                    ></el-menu-item>
                </el-menu>
            </el-col>
            <el-col :span="20">
                <div class="el-table-wrapper">
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
                </div>
                <!--
                <br><hr><br>
                <el-table
                    :data="tableData"
                    stripe
                >
                    <el-table-column
                        v-for="tableColumn in tableColumns"
                        :key="tableColumn"
                        :prop="tableColumn"
                        :label="tableColumn"
                    ></el-table-column>
                </el-table>
                -->
            </el-col>
        </el-row>
    </div>
</template>

<script>
import Knex from 'knex'

export default {
    data: () => ({
        knex: null,
        tables: [],
        tableActive: null,
        tableColumns: [],
        tableData: [],
        tableFilter: '',
    }),

    computed: {
        tablesFiltered () {
            return this.tables.filter(table => {
                return ! this.tableFilter || table.indexOf(this.tableFilter) !== -1
            })
        },
    },

    methods: {
        setTableActive (table) {
            if (table === this.tableActive) return

            this.tableActive = table
            this.loadTable(table)
        },

        loadTables () {
            this.knex = Knex({
                client: 'mysql',
                connection: {
                    host : '127.0.0.1',
                    user : 'docker',
                    password : 'secret',
                    database : 'docker',
                    dateStrings: true,
                },
            });

            this.knex.select('table_name')
                .from('information_schema.tables')
                .where({table_schema: 'docker'})
                .pluck('table_name')
                .then(tables => {
                    this.tables = tables
                    this.loadTable(tables[0])
                })
        },

        loadTable (table) {
            this.loadTableColumns(table)
            this.loadTableData(table)
        },

        loadTableColumns (table) {
            this.knex.from(table).columnInfo().then(tableColumns => {
                this.tableColumns = Object.keys(tableColumns)
            })
        },

        loadTableData (table) {
            this.knex.from(table).then(data => {
                this.tableData = data
            })
        }
    },

    filters: {
        str_limit (value) {
            return (value && value.length > 100)
                ? value.substring(0, 100).trim() + '...'
                : value
        },
    },

    mounted () {
        this.loadTables()
    }
}
</script>

<style>
body {
    font-family: Roboto, sans-serif;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

.el-table-wrapper {
    padding: 20px;
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
