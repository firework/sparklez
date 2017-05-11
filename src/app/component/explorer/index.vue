<template>
    <div class="explorer">
        <div class="explorer__header">
            <el-button-group>
                <el-button
                    type="primary"
                    icon="plus"
                    @click="createRow()"
                >
                    Create
                </el-button>

                <el-button
                    type="primary"
                    icon="edit"
                    :disabled="rowsSelected.length !== 1"
                    @click="openRow(tableData[rowsSelected[0]])"
                >
                    Edit
                </el-button>

                <el-button
                    type="primary"
                    icon="delete"
                    :disabled="rowsSelected.length === 0"
                    @click="deleteRows()"
                >
                    Delete
                </el-button>
            </el-button-group>

            <el-button type="info" @click="loadTable()">
                <i class="fa fa-fw fa-refresh"></i> Refresh
            </el-button>

            <el-button type="warning" @click="disconnect()">
                <i class="fa fa-fw fa-power-off"></i> Disconnect
            </el-button>
        </div>

        <el-tabs class="explorer__content">
            <el-tab-pane>
                <span slot="label">
                    <i class="fa fa-fw fa-file-text"></i> Content
                </span>

                <div>
                    <el-form :inline="true" :model="filter">
                        <el-form-item>
                            <el-select v-model="filter.column" placeholder="Column">
                                <el-option
                                    v-for="(column, key) in tableColumns"
                                    :key="key"
                                    :label="column.column_name"
                                    :value="column.column_name">
                                </el-option>
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
                            <el-input 
                                v-model="filter.value"
                                placeholder="Value"
                                :disabled="filterOperatorValue"
                            ></el-input>
                        </el-form-item>

                        <el-form-item>
                            <el-button type="primary" @click="loadTableData()">Filter</el-button>
                        </el-form-item>

                        <el-form-item>
                            <el-button type="warning" @click="resetFilterAndReload()">Reset Filter</el-button>
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
                                        <td v-for="(column, key) in tableColumns" :key="key">
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
                                :key="column.column_name"
                                :label="column.column_name">

                                <el-input
                                    v-model="rowForm[column.column_name]"
                                ></el-input>
                            </el-form-item>
                        </el-form>
                        <div slot="footer" class="dialog-footer">
                            <el-button @click="setRowActive(null)">Cancel</el-button>
                            <el-button type="primary" @click="submitRow(rowActive)">Confirm</el-button>
                        </div>
                    </el-dialog>
                </div>
            </el-tab-pane>

            <el-tab-pane>
                <span slot="label">
                    <i class="fa fa-fw fa-table"></i> Structure
                </span>

                <app-structure></app-structure>
            </el-tab-pane>
            
            <el-tab-pane>
                <span slot="label">
                    <i class="fa fa-fw fa-terminal"></i> Query
                </span>

                <app-query></app-query>
            </el-tab-pane>

            <el-tab-pane>
                <span slot="label">
                    <i class="fa fa-fw fa-list"></i> Query Log
                </span>

                <app-query-log></app-query-log>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import { 
    mapKeys as _mapKeys,
    without as _without,
    clone as _clone,
} from 'lodash'
import componentAsync from '~/js/componentAsync'
import AppStructure from './structure'
import AppQuery from './query'
import AppQueryLog from './queryLog'
import ConnectionMixin from '~/js/mixin/connection'
import AlertMessageMixin from '~/js/mixin/alertMessage'

export default {
    name: 'Content',

    mixins: [
        ConnectionMixin,
        AlertMessageMixin,
    ],

    components: {
        'app-structure': componentAsync.asyncComp(AppStructure),
        'app-query': componentAsync.asyncComp(AppQuery),
        'app-query-log': componentAsync.asyncComp(AppQueryLog),
    },
    
    data: () => ({
        rowsSelected: [],
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
                'IN',
                'LIKE',
                'IS NULL',
                'IS NOT NULL',
            ],
        },
        paginateSizes: [1, 50, 100, 200, 300, 400, 500, 1000],
        paginateNumber: 50,
        paginatePage: 1,
        rowActive: null,
        rowForm: null,
        rowType: 'update',
    }),

    watch: {
        tableActive () {
            this.loadTable(this.tableActive)
        },
    },

    computed: {
        filterOperatorValue () {
            return this.filter.operator === 'IS NULL' || this.filter.operator === 'IS NOT NULL'
        },

        hasRowActive () {
            return !!this.rowActive
        },
    },

    methods: {
        resetData () {
            this.paginateNumber = 50
            this.paginatePage = 1
            this.rowActive = null

            this.resetConnectionState()
        },

        disconnect () {
            this.updatePropertyConnection({ 'property': 'active', 'value': false})
            this.updatePropertyConnection({ 'property': 'tested', 'value': false})
            this.setKnex(null)

            this.resetData()
        },

        loadTable (table) {
            table = table || this.tableActive

            if ( ! table) return;

            this.rowsSelected = []
            this.resetFilter()

            this.loadTableCount(table)
            this.loadTableColumns(table)
            this.loadTableData(table)
        },

        resetFilter () {
            this.filter.column = null
            this.filter.operator = null
            this.filter.value = null
        },

        resetFilterAndReload () {
            this.resetFilter()
            this.loadTableData()
        },

        isRowSelected (key) {
            return this.rowsSelected.includes(key)
        },

        toggleRow (rowKey) {
            if (this.isRowSelected(rowKey)) {
                this.rowsSelected = _without(this.rowsSelected, rowKey)
            } else {
                this.rowsSelected.push(rowKey)
            }
        },

        loadTableCount (table) {
            this.prepareQuery(this.databaseActive, table)
                .count()
                .then(result => {
                    result = result[0]

                    this.setTableCount(result['count(*)'])
                })
        },

        loadTableColumns (table) {
            this.knex
                .select('*')
                .from('information_schema.columns')
                .where({
                    table_schema: this.databaseActive,
                    table_name: table,
                })
                .then(result => {
                    this.setTableColumns(
                        result.map(row =>
                            _mapKeys(row, (value, key) => key.toLowerCase())
                        )
                    )
                })
        },

        loadTableData (table) {
            this.prepareQueryWithFilters(this.databaseActive, table)
                .select('*')
                .limit(this.paginateNumber)
                .offset(this.paginateNumber * (this.paginatePage - 1))
                .then(data => {
                    this.setTableData(data)
                })
        },

        prepareQuery (database, table) {
            database = database || this.databaseActive
            table = table || this.tableActive

            return this.knex.withSchema(database).from(table)
        },

        prepareQueryWithFilters (database, table) {
            let query = this.prepareQuery()

            if (
                !this.filter.column ||
                !this.filter.operator
            ) {
                return query
            }

            switch (this.filter.operator) {
                case 'IS NULL':
                    return query.whereNull(this.filter.column)
                case 'IS NOT NULL':
                    return query.whereNotNull(this.filter.column)
            }

            if (!this.filter.value) {
                return query
            }

            if (this.filter.operator === 'IN') {
                return query.whereIn(
                    this.filter.column,
                    this.filter.value.split(',')
                )
            }

            return query.where(
                this.filter.column,
                this.filter.operator,
                this.filter.value
            )
        },

        setRowActive (row) {
            this.rowActive = row
            this.rowForm = _clone(row)
        },

        openRow (row, type = 'update') {
            this.setRowActive(row)
            this.rowType = type
        },

        createRow () {
            let row = {}

            this.tableColumns.forEach(column => {
                row[column] = null
            })

            this.openRow(row, 'create')
        },

        submitRow (row) {
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

        deleteRows (rowsSelected) {
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

        setPaginateNumber (number) {
            this.paginateNumber = number
            this.loadTable()
        },

        setPaginatePage (page) {
            this.paginatePage = page
            this.loadTable()
        },
    },
}
</script>

<style lang="scss">
.explorer {
    padding: 20px;

    &__header {
        margin-bottom: 30px;
    }

    &__content {
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
    }
}

.paginate {
    width: auto !important;
}

.fa-check-square-o {
    margin-left: 2px;
}
</style>
