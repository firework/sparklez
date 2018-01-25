export default {
    methods: {
        rawMessage(message, type) {
            this.$message({
                showClose: false,
                message,
                type,
            })
        },

        successMessage(message = 'No message') {
            this.rawMessage(message, 'success');
        },

        warningMessage(message = 'No message') {
            this.rawMessage(message, 'warning')
        },

        errorMessage(message = 'No message') {
            this.rawMessage(message, 'error')
        },
    },
}
