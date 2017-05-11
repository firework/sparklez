<template>
    <div id="structure" class="el-table">
        <table class="el-table__body" cellspacing="0" cellpadding="0">
            <thead>
                <tr>
                    <th>
                        <div class="cell">Field</div>
                    </th>
                    <th>
                        <div class="cell">Type</div>
                    </th>
                    <th>
                        <div class="cell">Length</div>
                    </th>
                    <th>
                        <div class="cell">Unsigned</div>
                    </th>
                    <th>
                        <div class="cell">Zerofill</div>
                    </th>
                    <th>
                        <div class="cell">Nullable</div>
                    </th>
                    <th>
                        <div class="cell">Key</div>
                    </th>
                    <th>
                        <div class="cell">Default</div>
                    </th>
                    <th>
                        <div class="cell">Extra</div>
                    </th>
                    <th>
                        <div class="cell">Comment</div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, key) in tableColumns" :key="key">
                    <td>
                        <div class="cell" v-text="row.column_name"></div>
                    </td>
                    <td>
                        <div class="cell" v-text="row.data_type"></div>
                    </td>
                    <td>
                        <div class="cell" v-text="getColumnLength(row.column_type)"></div>
                    </td>
                    <td>
                        <div class="cell">
                            <i class="fa fa-fw" :class="{
                                'fa-check-square-o': isColumnUnsigned(row.column_type),
                                'fa-square-o': !isColumnUnsigned(row.column_type),
                            }"></i>
                        </div>
                    </td>
                    <td>
                        <div class="cell">
                            <i class="fa fa-fw" :class="{
                                'fa-check-square-o': isColumnZerofill(row.column_type),
                                'fa-square-o': !isColumnZerofill(row.column_type),
                            }"></i>
                        </div>
                    </td>
                    <td>
                        <div class="cell">
                            <i class="fa fa-fw" :class="{
                                'fa-check-square-o': isColumnNullable(row.is_nullable),
                                'fa-square-o': !isColumnNullable(row.is_nullable),
                            }"></i>
                        </div>
                    </td>
                    <td>
                        <div class="cell" v-text="row.column_key"></div>
                    </td>
                    <td>
                        <div class="cell" v-text="row.column_default"></div>
                    </td>
                    <td>
                        <div class="cell" v-text="row.extra"></div>
                    </td>
                    <td>
                        <div class="cell" v-text="row.column_comment"></div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import ConnectionMixin from '~/js/mixin/connection'

export default {
    name: 'Structure',

    mixins: [
        ConnectionMixin
    ],

    methods: {
        getColumnLength(type) {
            let match = new RegExp(/(.+)\(([0-9]+)\)(.+)?/).exec(type)

            if (match) return match[2]
        },

        isColumnUnsigned(type) {
            return type.indexOf('unsigned') !== -1
        },

        isColumnZerofill(type) {
            return type.indexOf('zerofill') !== -1
        },

        isColumnNullable(isNullable) {
            return isNullable === 'YES'
        },
    },
}
</script>