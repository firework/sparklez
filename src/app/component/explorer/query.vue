<template>
    <div id="query">
        <el-form>
            <el-form-item>
                <el-input type="textarea" :autosize="{ minRows: 10 }" placeholder="Execute Query" v-model="query"></el-input>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="executeQuery()">Execute Query</el-button>
            </el-form-item>
        </el-form>

        <div class="el-table">
            <table class="el-table__body" cellspacing="0" cellpadding="0">
                <thead>
                    <tr>
                        <th v-for="column in queryColumns" :key="column">
                            <div class="cell">{{ column }}</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, key) in queryData" :key="key">
                        <td v-for="column in queryColumns" :key="column">
                            <div class="cell">{{ row[column] | str_limit }}</div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="el-table__empty-block" v-if="queryData.length === 0">
                <span class="el-table__empty-text">No result</span>
            </div>
        </div>
    </div>
</template>

<script>
import ConnectionMixin from '../../../js/mixin/connection.js'
import AlertMessageMixin from '../../../js/mixin/alertMessage.js'

export default {
    name: 'Query',

    mixins: [
        ConnectionMixin,
        AlertMessageMixin,
    ],

    data: () => ({
        query: null,
        queryColumns: [],
        queryData: [],
    }),

    methods: {
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
                    this.errorMessage('Something went wrong.')
                    console.error(error)
                })
        },
    },
}
</script>