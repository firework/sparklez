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
                            <el-input
                                placeholder="secret"
                                type="password"
                                v-model="connection.password"
                                >
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

        <el-row v-else>
            <el-col :span="4">
                <el-menu class="has-full-height" @select="changeTableActive">
                    <li class="el-menu-item">
                        <el-select
                            v-model="databaseActive"
                            @input="loadTables"
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
            password: [{
                required: true,
                message: 'Please input password',
                trigger: 'blur'
            }]
        },
        defaultConnection: {
            name: 'localhost',
            host: '127.0.0.1',
            port: '3306',
            user: 'root',
            active: false,
            tested: false,
        }
    }),

    computed: {
        tablesFiltered() {
            return this.tables.filter(
                table =>
                    !this.tableFilter || table.indexOf(this.tableFilter) !== -1
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
        saveAsFavorite() {
            this.favorites.push(
                _omit(this.connection, 'dateStrings', 'active', 'tested')
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
            let knex = Knex({
                client: 'mysql',
                connection: _omit(this.connection, 'active'),
            })

            this.setKnex(knex)
        },

        setDefaultValues() {
            this.replaceEmpty(this.connection, this.defaultConnection)
            this.setConnection(this.connection)
        },

        replaceEmpty(obj, def) {
            for (var prop in obj) {
                if (obj[prop]) continue;

                obj[prop] = def[prop]
            }
        },

        // TODO: think a better way to test connection
        testConnection() {
            this.setDefaultValues()
            this.knex = this.getKnex()

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

                    this.loadDatabases()
                })
                .catch((e) => this.errorMessage(e))
        },

        changeTableActive(table) {
            if (!table || table === this.tableActive) return

            this.setTableActive(table)
        },

        loadDatabases() {
            return this.knex.raw('show databases').then(databases => {
                this.databases = databases[0].map(db => db.Database)
                this.setDatabaseActive(this.connection.database)

                if (this.databases.includes(this.connection.database)) {
                    this.loadTables(this.connection.database)
                }
            })
        },

        loadTables(database) {
            database = database || this.databaseActive
            this.setDatabaseActive(database)
            this.knex
                .select('table_name')
                .from('information_schema.tables')
                .where({ table_schema: database })
                .pluck('table_name')
                .then(tables => {
                    this.tables = tables
                    this.changeTableActive(tables[0])
                })
        },
    },

    created() {
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || []
    },
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto:100,400,400i,700');
@import './css/theme/index.css';
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

.sidebar {
    @extend .has-full-height;
    background-color: #eef1f6;
}

.el-select {
    width: 100%;
}
</style>
