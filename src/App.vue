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
                                @dblclick.native="connect()"
                            >
                                <i class="fa fa-fw fa-database"></i>
                                <span v-text="favorite.database"></span>
                                <i class="fa fa-fw fa-times" @click.stop="removeFavorite(key)"></i>
                            </el-menu-item>
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

                    <!-- DIALOG DELETE -->
                    <el-dialog
                        :visible.sync="dialog.showDialogDelete"
                        :title="dialog.title"
                        :close-on-click-modal="false"
                        @click="closeModal()"
                    >
                        <el-form
                            v-if="dataTypeTable"
                            :model="tableSelected"
                            :rules="ruleTable"
                        >
                            <el-form-item key="delete" label="Name" prop="select">
                                <el-select
                                    v-model="tableSelected.select"
                                    filterable
                                >
                                    <el-option key="placeholder" :value="dialog.resetSelected"></el-option>
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
                                    <el-option key="placeholder" :value="dialog.resetSelected"></el-option>
                                    <el-option
                                        v-for="database in databases"
                                        :key="database"
                                        :label="database"
                                        :value="database"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>

                        <div slot="footer" class="dialog-footer">
                            <el-button @click="closeModal()">Cancel</el-button>
                            <el-button type="primary" @click="executeQuery()">Confirm</el-button>
                        </div>
                    </el-dialog>

                    <!-- DIALOG ADD -->
                    <el-dialog
                        :visible.sync="dialog.showDialogAdd"
                        :title="dialog.title"
                        :close-on-click-modal="false"
                        @click="closeModal()"
                    >
                        <el-form :model="newName" :rules="ruleName">
                            <el-form-item key="add" label="Name" prop="name">
                                <el-input type="text" v-model="newName.name"></el-input>
                            </el-form-item>
                        </el-form>

                        <div v-if="dataTypeTable">
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
import Knex from 'knex';
import Rules from '~/js/rules/rules';
import componentAsync from '~/js/componentAsync';
import AppExplorer from '~/app/component/explorer/index';
import ConnectionMixin from '~/js/mixin/connection';
import AlertMessageMixin from '~/js/mixin/alertMessage';

export default {
    name: 'App',

    mixins: [ConnectionMixin, AlertMessageMixin],

    components: {
        'app-explorer': componentAsync.asyncComp(AppExplorer),
    },

    data: () => ({
        ...Rules,
        favorites: [],
        databases: [],
        tables: [],
        tableFilter: '',
        newName: { name: '' },
        tableSelected: { select: '' },
        databaseSelected: { select: '' },
        inputColumn: [
            {id: '', name: '', type: ''},
        ],
        defaultConnection: {
            name: 'localhost',
            host: '127.0.0.1',
            port: '3306',
            user: 'root',
            active: false,
            tested: false,
            multipleStatements: true,
        },
        dialog: {
            showDialogAdd: false,
            showDialogDelete: false,
            title: '',
            add: '',
            dataType: '',
            resetSelected: 'Select',
            index: 0,
        }
    }),

    computed: {
        tablesFiltered() {
            return this.tableFilter
                ? this.tables.filter(table => table.includes(this.tableFilter))
                : this.tables;
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

        dataTypeTable () {
            if (this.dialog.dataType === 'table') {
                return true;
            }
            else {
                return false;
            }
        },
    },

    watch: {
        favorites (favorites) {
            localStorage.setItem('favorites', JSON.stringify(favorites));
        },
    },

    methods: {
        addColumn () {
            this.inputColumn.push({
                id:(this.dialog.index++),
                name:'',
                type: ''
            });
        },

        removeRow (row) {
            this.inputColumn.splice(row, 1);
        },

        toggleModal (title, add, type) {
            this.dialog.title = title;
            this.dialog.dataType = type;
            this.dialog.add = add;

            add ? this.dialog.showDialogAdd = true : this.dialog.showDialogDelete = true;
        },

        closeModal () {
            this.dialog.showDialogAdd = false;
            this.dialog.showDialogDelete = false;
            this.newName.name = null;
        },

        getElementsColumns () {
            return _
                .chain(this.inputColumn)
                .transform((acc, input, index) => {
                    let name = _.capitalize(input.name.toLowerCase());
                    let type = input.type.toUpperCase();

                    acc[index] = `${name} ${type}`;
                })
                .join(',')
                .value();
        },

        executeQuery() {
            let action, type, query, name;

            action = this.dialog.add ? 'CREATE ' : 'DROP ';
            type = this.dataTypeTable ? 'TABLE ' : 'DATABASE ';

            this.newName.name
                ? name = this.newName.name
                : name = this.tableSelected.select || this.databaseSelected.select;

            query = action + type + name;

            if (this.newName.name) {
                if (this.dataTypeTable) {
                    query += ' ( ' + this.getElementsColumns() + ' )';
                    this.sendQuery(query, ' table created!', 'Table already exists');
                }
                else {
                    this.sendQuery(query, ' database created!', 'Database already exists');
                }
            }
            else if (this.tableSelected.select || this.databaseSelected.select) {
                if (this.dataTypeTable) {

                    if (this.checkForeignKey()) {
                        this.dropTableWithForeignKey(this.tableSelected.select);
                    }
                    else {
                        this.sendQuery(query, ' table deleted!', 'Something went wrong.');
                    }
                }
                else {
                    this.sendQuery(query, ' database deleted!', 'Something went wrong.');
                }
            }
        },

        checkForeignKey () {
            let query = "SELECT * FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = '" + this.databaseActive + "'";

            this.knex.raw(query).then(result => {
                result = result[0];
                result.forEach(line => {

                    if (line.CONSTRAINT_NAME !== 'PRIMARY') {
                        return true;
                    }
                    else {
                        return false;
                    }
                })
            })
        },

        dropTableWithForeignKey (table) {
            let fk0 = "SET foreign_key_checks = 0";
            let drop = "DROP TABLE " + table;
            let fk1 = "SET foreign_key_checks = 1";

            this.knex.raw(fk0).then(result => {
                result = result[0];
            });

            this.knex.raw(drop).then(result => {
                result = result[0];
                this.successMessage(`${result.affectedRows} table with foreign key deleted!`);
            })
            .catch(error => {
                this.errorMessage('Something went wrong.');
                console.error(error);
            });

            this.knex.raw(fk1).then(result => {
                result = result[0];
            });
        },

        sendQuery (query, success, failure) {
            this.knex.raw(query).then(result => {
                result = result[0];
                let rows = (this.newName.name && this.dialog.dataType == 'database') ? `${result.affectedRows}` : `${result.affectedRows+1}`;
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
                _.omit(this.connection, 'dateStrings', 'active', 'tested')
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
                connection: _.omit(this.connection, 'active'),
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

            return this.loadDatabases().then(() => {
                this.connection.tested = true
                this.successMessage('Connection accepted.')
            })
        },

        connect() {
            this.testConnection().then(() => {
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

                                return _.isNumber(value) || _.isNull(value) ?
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
