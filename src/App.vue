<template>
    <div id="app">
        <el-row :gutter="20">
            <el-col :span="4">
                <el-menu v-show="tables.length">
                    <el-menu-item
                        v-for="table in tables"
                        :key="table"
                        :index="table"
                        v-text="table"
                        @click="setTableActive(table)"
                    ></el-menu-item>
                </el-menu>
            </el-col>
            <el-col :span="20">
                <el-table :data="tableData" stripe>
                    <el-table-column
                        v-for="tableColumn in tableColumns"
                        :key="tableColumn"
                        :prop="tableColumn"
                        :label="tableColumn"
                    ></el-table-column>
                </el-table>
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
    }),

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
}
</style>
