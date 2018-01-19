export default {
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
}
