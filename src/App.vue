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
                                <span v-text="favorite.database"></span>
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
                            <el-input
                                placeholder="secret"
                                type="password"
                                v-model="connection.password"
                            >
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
                                <el-button
                                    type="primary"
                                    @click="saveAsFavorite()"
                                >
                                    <i class="fa fa-fw fa-star"></i> Save as favorite
                                </el-button>

                                <el-button
                                    type="primary"
                                    @click="testConnection()"
                                >
                                    <i class="fa fa-fw fa-bolt"></i> Test connection
                                </el-button>

                                <el-button
                                    type="primary"
                                    @click="connect()"
                                >
                                    <i class="fa fa-fw fa-plug"></i> Connect
                                </el-button>
                            </el-button-group>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>

        <el-row v-else> <!-- SIDE BAR - INDEX -->
            <el-col :span="4">
                <el-menu class="has-full-height" @select="changeTableActive">

                    <div class="add-delete-buttons">
                        <el-button
                            plain
                            title="Create database"
                            class="initial-buttons"
                            @click="toggleModal('New database', true, 'database')"
                        >
                            <i class="first-icon fa fa-plus-circle"></i>
                            <i class="second-icon fa fa-database"></i>
                        </el-button>

                        <el-button
                            plain
                            title="Remove database"
                            class="initial-buttons"
                            @click="toggleModal('Delete database', false, 'database')"
                        >
                            <i class="first-icon fa fa-minus-circle"></i>
                            <i class="second-icon fa fa-database"></i>
                        </el-button>

                        <el-button
                            plain
                            title="Create table"
                            class="initial-buttons"
                            @click="toggleModal('New table', true, 'table')"
                        >
                            <i class="first-icon fa fa-plus-circle"></i>
                            <i class="second-icon fa fa-table"></i>
                        </el-button>

                        <el-button
                            plain
                            title="Remove table"
                            class="initial-buttons"
                            @click="toggleModal('Delete table', false, 'table')"
                        >
                            <i class="first-icon fa fa-minus-circle"></i>
                            <i class="second-icon fa fa-table"></i>
                        </el-button>
                    </div>


                    <el-dialog
                        :visible.sync="showDialogCreate"
                        :title="dialogTitle"
                        :close-on-click-modal="false"
                        @click="closeModal()"
                    >
                        <div class="form_holder">
                            <div v-if="showAddInput">
                                <el-form :model="newName" :rules="ruleName">
                                    <el-form-item key="add" label="Name" prop="name">
                                        <el-input type="text" v-model="newName.name"></el-input>
                                    </el-form-item>
                                </el-form>

                                <div v-if="(dataType == 'table' ? true : false)">
                                    <table class="db_column_table" cellspacing="0">
                                        <tr>
                                            <th colspan="3">
                                                <span class="required">*</span>
                                                Columns info
                                            </th>
                                        </tr>
                                        <tr v-for="(row, index) in inputColumn" :key="index">
                                            <el-form :model="row" :rules="ruleRow">
                                                <el-form-item>
                                                    <tr class="db_column_table_item">
                                                        <td>
                                                            <el-form-item prop="name">
                                                                <el-input placeholder="Name" v-model="row.name"></el-input>
                                                            </el-form-item>
                                                        </td>
                                                        <td>
                                                            <el-form-item prop="type">
                                                                <el-input placeholder="Type" v-model="row.type"></el-input>
                                                            </el-form-item>
                                                        </td>

                                                        <td>
                                                            <el-button type="danger" plain @click="removeRow(index)">
                                                                <i class="fa fa-times"></i>
                                                            </el-button>
                                                        </td>
                                                    </tr>
                                                </el-form-item>
                                            </el-form>
                                        </tr>
                                    </table>
                                    <el-button plain @click="addColumn()">New column</el-button>
                                </div>
                            </div>

                            <div v-else>
                                <el-form
                                    v-if="(dataType == 'table' ? true : false)"
                                    :model="tableSelected"
                                    :rules="ruleTable"
                                >
                                    <el-form-item key="delete" label="Name" prop="select">
                                        <el-select
                                            v-model="tableSelected.select"
                                            filterable
                                        >
                                            <el-option key="placeholder" :value="resetSelected"></el-option>
                                            <el-option
                                                v-for="table in tables"
                                                :key="table"
                                                :label="table"
                                                :value="table"
                                            ></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-form>

                                <el-form
                                    v-else
                                    :model="databaseSelected"
                                    :rules="ruleTable"
                                >
                                    <el-form-item label="Name" prop="select">
                                        <el-select
                                            v-model="databaseSelected.select"
                                            filterable
                                        >
                                            <el-option key="placeholder" :value="resetSelected"></el-option>
                                            <el-option
                                                v-for="database in databases"
                                                :key="database"
                                                :label="database"
                                                :value="database"
                                            ></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-form>
                            </div>
                        </div>

                        <div slot="footer" class="dialog-footer">
                            <el-button @click="closeModal()">Cancel</el-button>
                            <el-button type="primary" @click="executeQuery()">Confirm</el-button>
                        </div>
                    </el-dialog>

                    <li class="el-menu-item">
                        <el-select
                            v-model="computedDatabaseActive"
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
                <app-explorer></app-explorer>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import Knex from 'knex'
import {
    isNull as _isNull,
    isNumber as _isNumber,
    omit as _omit,
    get as _get,
} from 'lodash'
import componentAsync from '~/js/componentAsync'
import AppExplorer from '~/app/component/explorer/index'
import ConnectionMixin from '~/js/mixin/connection'
import AlertMessageMixin from '~/js/mixin/alertMessage'

export default {
    name: 'App',

    mixins: [ConnectionMixin, AlertMessageMixin],

    components: {
        'app-explorer': componentAsync.asyncComp(AppExplorer),
    },

    data: () => ({
        favorites: [],
        databases: [],
        tables: [],
        tableFilter: '',
        rules: {
            password: [
                { required: true, message: 'Please input password', trigger: 'blur'}
            ],
        },
        ruleName: {
            name: [
                { required: true, message: 'Please input the name', trigger: 'blur'}
            ],
        },
        ruleRow: {
            name: [
                { required: true, message: 'Please input the column name', trigger: 'blur'}
            ],
            type: [
                { required: true, message: 'Please input the column type', trigger: 'blur'}
            ],
        },
        ruleTable: {
            select: [
                { required: true, message: 'Please select', trigger: 'change'}
            ],
        },
        newName: {
            name: '',
        },
        inputColumn: [
            {id: '', name: '', type: ''},
        ],
        tableSelected: {
            select: '',
        },
        databaseSelected: {
            select: '',
        },
        defaultConnection: {
            name: 'localhost',
            host: '127.0.0.1',
            port: '3306',
            user: 'root',
            active: false,
            tested: false,
        },
        showDialogCreate: false,
        dialogTitle: '',
        showAddInput: '',
        dataType: '',
        resetSelected: 'Select',
        index: 0,
    }),

    computed: {
        tablesFiltered() {
            return this.tables.filter(
                table => !this.tableFilter || table.indexOf(this.tableFilter) !== -1
            )
            this.loadDatabases();
        },

        computedDatabaseActive: {
            get () {
                return this.databaseActive;
            },

            set (newValue) {
                this.setDatabaseActive(newValue);
                this.loadTables(newValue);
            },
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
            localStorage.setItem('favorites', JSON.stringify(favorites));

            return favorites;
        },
    },

    methods: {
        addColumn () {
            this.inputColumn.push({id:(this.index++), name:'', type: ''});
        },

        removeRow (row) {
            this.inputColumn.splice(row, 1);
        },

        toggleModal (title, add, type) {
            this.showDialogCreate = !this.showDialogCreate;
            this.dialogTitle = title;
            this.showAddInput = add;
            this.dataType = type;
        },

        closeModal () {
            this.showDialogCreate = false;
            this.newName.name = null;
        },

        capitalize (word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        },

        getElementsColumns (inputColumn) {
            let columnName=[], columnType=[], elements=[];

            this.inputColumn.forEach(input => {
                columnName.push( this.capitalize( (input.name).toLowerCase() ) );
                columnType.push( (input.type).toUpperCase() );
            })

            for (let i = 0; i < columnName.length; i++) {
                if (i != columnName.length -1) {
                    elements += columnName[i] + " " + columnType[i] + ", ";
                } else {
                    elements += columnName[i] + " " + columnType[i];
                }
            }
            return elements;
        },

        executeQuery() {
            let action, type, query;

            action = this.showAddInput ? 'CREATE ' : 'DROP ';
            type = (this.dataType == 'database') ? 'DATABASE ' : 'TABLE ';

            // PARA ADICIONAR DATABASE E TABLE
            if (this.newName.name) {

                if (this.dataType == "table") {
                    query = action + type + this.newName.name + " ( " + this.getElementsColumns(this.inputColumn) + " );";
                    this.sendQuery(query, ' table created!', 'Table already exists');
                }
                else {
                    query = action + type + this.newName.name + ";";
                    this.sendQuery(query, ' database created!', 'Database already exists');
                }
            }

            // PARA DELETAR DATABASE E TABLE
            else if (this.tableSelected.select || this.databaseSelected.select) {

                if (this.dataType == "table") {
                    query = action + type + this.tableSelected.select + ";";
                    this.sendQuery(query, ' table deleted!', 'Something went wrong.');
                }
                else {
                    query = action + type + this.databaseSelected.select + ";";
                    this.sendQuery(query, ' database deleted!', 'Something went wrong.');
                }
            }
        },

        sendQuery (query, success, failure) {
            let rows;
            this.knex.raw(query).then(result => {
                console.log()
                result = result[0];
                rows = (this.newName.name && this.dataType == 'database') ? `${result.affectedRows}` : `${result.affectedRows+1}`;
                this.successMessage(rows + success);

                this.loadDatabases();
            })
            .catch(error => {
                this.errorMessage(failure);
                console.error(error);
            })
        },

        saveAsFavorite() {
            this.favorites.push(
                _omit(this.connection, 'dateStrings', 'active', 'tested')
            )
            this.successMessage('Connection added on favorites.');
        },

        // @TODO: check connection.favorite === true to disable favorite button
        setFavorite(favorite) {
            for (let key in favorite) {
                this.connection[key] = favorite[key];
            }
        },

        removeFavorite(key) {
            this.favorites.splice(key, 1);
        },

        getKnex() {
            let knex = Knex({
                client: 'mysql',
                connection: _omit(this.connection, 'active'),
            });

            this.setKnex(knex);
        },

        setDefaultValues() {
            this.replaceEmpty(this.connection, this.defaultConnection);
            this.setConnection(this.connection);
        },

        replaceEmpty(obj, def) {
            for (var prop in obj) {
                if (obj[prop]) continue;

                obj[prop] = def[prop]
            }
        },

        // TODO: think a better way to test connection
        testConnection() {
            this.setDefaultValues();

            // Force Propagation
            this.getKnex();

            return this.loadDatabases()
                            .then(() => {
                                this.connection.tested = true
                                this.successMessage('Connection accepted.')
                            })
        },

        connect() {
            this.testConnection()
                .then(() => {
                    this.updatePropertyConnection({
                        property: 'active',
                        value: true
                    })

                    this.knex.on('query', data => {
                        // pluck are the internal queries to get databases, tables and columns
                        if (data.method === 'pluck') return

                        let index = 0

                        this.setQueryLog({
                            ranAt: new Date(),
                            sql: data.sql.replace(/\?/g, () => {
                                let value = data.bindings[index++]

                                return _isNumber(value) || _isNull(value) ?
                                    value :
                                    `'${value}'`
                            }),
                        })
                    })

                    this.loadDatabases();
                    return true;
                })
                .catch((e) => this.errorMessage(e));
        },

        changeTableActive(table) {
            if (!table || table === this.tableActive) {
                return;
            }

            this.setTableActive(table);
        },

        loadDatabases() {
            return this.knex.raw('show databases').then(databases => {
                this.databases = databases[0].map(db => db.Database);
                this.setDatabaseActive(this.connection.database);

                if (this.databases.includes(this.connection.database)) {
                    this.loadTables(this.connection.database);
                }
                return true;
            })
        },

        loadTables(database) {
            database = database || this.databaseActive;

            this.knex
                .select('table_name')
                .from('information_schema.tables')
                .where({ table_schema: database })
                .pluck('table_name')
                .then(tables => {
                    this.tables = tables
                    this.changeTableActive(tables[0])
                });
        },
    },

    created() {
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || []
    },
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto:100,400,400i,700');
@import '~font-awesome/css/font-awesome.css';
@import '~highlight.js/styles/github.css';

body {
    font-family: 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

.has-full-height {
    height: 100vh;
    overflow: auto;
    box-sizing: border-box;
}

.db_column_table {
    width: 100%;

    th { text-align: left; }

    .db_column_table_item {
        display: table;
        width: 100%;
    }
}

.sidebar {
    @extend .has-full-height;
    background-color: #eef1f6;
}

.el-select { width: 100%; }

.add-delete-buttons {
    padding-left: 20px;
    margin-top: 20px;
    padding-right: 20px;
    width: auto;

    .el-button+.el-button { margin-left: 0px; }
}

.required { color: #ff4949;}

.initial-buttons {
    padding-right: 9px;
    padding-left: 9px;
    position: relative;
    margin: 0;

    .second-icon { font-size: 18px; }

    .first-icon {
        font-size: 13px;
        position: absolute;
        bottom: 3px;
        left: 3px;
    }
}
</style>
