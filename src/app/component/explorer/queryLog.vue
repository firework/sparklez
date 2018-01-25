<template>
    <div id="query-log" class="el-table table-bordered">
        <table class="el-table__body" v-resize cellspacing="0" cellpadding="0">
            <thead>
                <tr>
                    <th>
                        <div>Ran At</div>
                    </th>
                    <th>
                        <div>Query</div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(query, key) in queryLog" :key="key">
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
</template>

<script>
import ConnectionMixin from '~/js/mixin/connection'

export default {
    name: 'QueryLog',

    mixins: [ConnectionMixin],
}
</script>
