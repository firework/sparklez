<template>
    <div class="explorer has-full-height">  <!-- QUADRO A DIREITA -->
        <div class="explorer__header">
            <el-button-group>
                <el-button
                    type="primary"
                    icon="plus"
                    @click="createRow('Create Row')"
                >
                    Create
                </el-button>

                <el-button
                    type="primary"
                    icon="edit"
                    :disabled="rowsSelected.length !== 1"
                    @click="openRow(tableData[rowsSelected[0]], 'Edit Row')"
                >
                    Edit
                </el-button>

                <el-button
                    type="primary"
                    icon="delete"
                    :disabled="rowsSelected.length === 0"
                    @click="confirmDelete()"
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
                            <div class="el-table__body">
                                <table class="el-table__body" cellspacing="0" cellpadding="0">
                                    <thead>
                                        <tr class="el-table__row">
                                            <th v-for="(column, key) in tableColumns" :key="key">
                                                <div class="cell" v-text="column.column_name">
                                                    {{ resizeTable() }}
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="(row, key) in tableData"
                                            :key="key"
                                            class="el-table__row"
                                            :class="{'current-row': isRowSelected(key)}"
                                            @dblclick="openRow(row, 'Edit Row')"
                                            @click="toggleRow(key)"
                                        >
                                            <td v-for="(column, key) in tableColumns" :key="key">
                                                <div
                                                    class="cell"
                                                    :class="{ 'is-nowrap': column.data_type === 'timestamp' }"
                                                >
                                                     {{ row[column.column_name] | str_limit }}
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>


                            <div class="el-table__empty-block" v-if="tableData.length === 0">
                                <span class="el-table__empty-text">No result</span>
                            </div>
                        </div>


                        <!-- <el-table
                            :data="tableData"
                            :row-key="getKey"
                            :row-class-name="getClass"
                            border=""
                            style="width: 100%"
                            @row-click="toggleRow(getKey)"
                            @row-dblclick="openRow(getRow(tableData), 'Edit Row')"
                        >
                            <el-table-column
                                v-for="(row, key) in tableColumns"
                                :prop="row.column_name"
                                :label="row.column_name"
                                :key="key"
                            >{{ getRow (tableData) }}</el-table-column>
                        </el-table> -->
                    </div>

                    <el-dialog
                        :visible.sync="showDialogEdit"
                        :title="title"
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

                                <el-input v-model="rowForm[column.column_name]"></el-input>
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
import Vue from 'vue'
import componentAsync from '~/js/componentAsync'
import AppStructure from './structure'
import AppQuery from './query'
import AppQueryLog from './queryLog'
import ConnectionMixin from '~/js/mixin/connection'
import AlertMessageMixin from '~/js/mixin/alertMessage'

export default {
    name: 'Content',

    mixins: [ConnectionMixin, AlertMessageMixin],

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
        showDialogEdit: false,
        title: '',
    }),

    watch: {
        tableActive() {
            this.loadTable(this.tableActive);
        },
    },

    computed: {
        filterOperatorValue() {
            return (
                this.filter.operator === 'IS NULL' ||
                this.filter.operator === 'IS NOT NULL'
            )
        },

        hasRowActive() {
            return !! this.rowActive;
        },
    },

    methods: {
        resizeTable () {
            let title, startOffset;

            Array.prototype.forEach.call(
                document.querySelectorAll("table th"),
                    function (th) {
                        th.style.position = 'relative';

                        var grip = document.createElement('div');
                        grip.innerHTML = "&nbsp;";
                        grip.style.top = 0;
                        grip.style.right = 0;
                        grip.style.bottom = 0;
                        grip.style.width = '5px';
                        grip.style.position = 'absolute';
                        grip.style.cursor = 'col-resize';
                        grip.addEventListener('mousedown', function (e) {
                            title = th;
                            startOffset = th.offsetWidth - e.pageX;
                        });

                        th.appendChild(grip);
                });

                document.addEventListener('mousemove', function (e) {
                    if (title) {
                        title.style.width = startOffset + e.pageX + 'px';
                    }
                });

                document.addEventListener('mouseup', function () {
                    title = undefined;
                });
        },

        // getKey (rows) {
        //     if(rows) {
        //         // console.log(rows);

        //         Object.keys(rows).forEach(row => {
        //             // console.log(rows.ID);
        //             return rows.ID;
        //         });
        //     }
        // },

        // getClass ({row, rowIndex}) {
        //     if(this.isRowSelected(rowIndex)) {
        //         return "current-row";
        //     }
        //     else {
        //         return "";
        //     }
        // },

        // getRow (tableData) {
        //     tableData.forEach(row => {
        //         return row;
        //     })
        //     // console.log(JSON.stringify(tableData));
        //     // return JSON.stringify(tableData);
        // },

        resetData() {
            this.paginateNumber = 50;
            this.paginatePage = 1;
            this.rowActive = null;

            this.resetConnectionState();
        },

        confirmDelete() {
            this.$confirm('This will permanently delete the row. Continue?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
           }).then(() => {
                this.deleteRows()
           }).catch(() => {});
        },

        disconnect() {
            this.updatePropertyConnection({ property: 'active', value: false });
            this.updatePropertyConnection({ property: 'tested', value: false });
            this.setKnex(null);

            this.resetData();
        },

        loadTable(table) {
            table = table || this.tableActive;

            if (!table) return;

            this.rowsSelected = [];
            this.resetFilter();

            this.loadTableCount(table);
            this.loadTableColumns(table);
            this.loadTableData(table);
        },

        resetFilter() {
            this.filter.column = null;
            this.filter.operator = null;
            this.filter.value = null;
        },

        resetFilterAndReload() {
            this.resetFilter();
            this.loadTableData();
        },

        isRowSelected(key) {
            return this.rowsSelected.includes(key);
        },

        toggleRow(rowKey) {
            if (this.isRowSelected(rowKey)) {
                this.rowsSelected = _without(this.rowsSelected, rowKey);
            } else {
                this.rowsSelected.push(rowKey);
            }
        },

        loadTableCount(table) {
            this.prepareQuery().count().then(result => {
                result = result[0];

                this.setTableCount(result['count(*)']);
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
                    this.setTableColumns(
                        result.map(row =>
                            _mapKeys(row, (value, key) => key.toLowerCase())
                        )
                    )
                })
        },

        loadTableData(table) {
            this.prepareQueryWithFilters(this.databaseActive, table)
                .select('*')
                .limit(this.paginateNumber)
                .offset(this.paginateNumber * (this.paginatePage - 1))
                .then(data => {
                    this.setTableData(data)
                })
        },

        prepareQuery(database, table) {
            database = database || this.databaseActive;
            table = table || this.tableActive;

            return this.knex.withSchema(database).from(table);

        },

        prepareQueryWithFilters(database, table) {
            let query = this.prepareQuery();

            if (!this.filter.column || !this.filter.operator) {
                return query;
            }

            switch (this.filter.operator) {
                case 'IS NULL':
                    return query.whereNull(this.filter.column);
                case 'IS NOT NULL':
                    return query.whereNotNull(this.filter.column);
            }

            if (!this.filter.value) {
                return query;
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

        setRowActive(row) {
            this.rowActive = row;
            this.rowForm = _clone(row);
            this.showDialogEdit = !! row;
        },

        openRow(row, title, type = 'update') {
            this.setRowActive(row);
            this.rowType = type;
            this.title = title;
        },

        createRow(title) {
            let row = {};

            this.tableColumns.forEach(column => {
                row[column.column_name] = null;
            })

            this.openRow(row, title, 'create');

        },

        submitRow(row) {
            let query = this.prepareQuery();

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
                    this.$alert(error.message.split(':')[1], 'Something went wrong!')
                    console.error(error)
                })
        },

        deleteRows(rowsSelected) {
            rowsSelected = rowsSelected || this.rowsSelected;

            this.knex
                .transaction(trx => {
                    let deletes = rowsSelected.map(rowKey => {
                        let row = this.tableData[rowKey]

                        return this.prepareQuery()
                            .transacting(trx)
                            .where(row)
                            .delete()
                    })

                    Promise.all(deletes).then(trx.commit).catch(trx.rollback)
                })
                .then(
                    result =>
                        new Promise(resolve => {
                            this.successMessage(
                                `${result.length} Row(s) deleted.`
                            )
                            this.loadTable()

                            resolve()
                        })
                )
                .catch(error => {
                    this.$alert(error.message.split(':')[1], 'Something went wrong!')
                })
        },

        setPaginateNumber(number) {
            this.paginateNumber = number;
            this.loadTable();
        },

        setPaginatePage(page) {
            this.paginatePage = page;
            this.loadTable();
        },
    },
}
</script>

<style lang="scss">

// @TODO: create a new style to generic classes
.is-nowrap {
    white-space: nowrap !important;
}

.explorer {
    padding: 20px;

    &__header {
        margin-bottom: 30px;
    }

    &__content {

        table th, table td {
            &:not(:last-child) {
                border-right: 1px solid #dfe6ec;
                border-bottom: 1px solid #dfe6ec;
            }
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

        .el-pagination__editor {
            border: 0;
            padding: 0;
        }
    }
}

.paginate {
    width: auto !important;
}
</style>
