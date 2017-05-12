const filters = {
    str_limit(value) {
        return value && value.length > 100
            ? value.substring(0, 100).trim() + '...'
            : value
    },
}

export default (Vue, options) => {
    Object.keys(filters).forEach(key => {
        if (Vue.filter(key)) {
            console.warn(
                '[filter duplication]: A filter named ' +
                    key +
                    'has already been installed.'
            )
        } else {
            Vue.filter(key, filters[key])
        }
    })
}
