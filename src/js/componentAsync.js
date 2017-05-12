import { defer as _defer } from 'lodash'
import AppLoading from '~/app/global/loading.vue'
import AppError from '~/app/global/error.vue'

export default {
    asyncComp(component, loading, error) {
        loading = loading || AppLoading
        error = error || AppError

        return () => ({
            component: new Promise((resolve, reject) => {
                _defer(() => {
                    resolve(component)
                })
            }),
            loading: loading,
            error: error,
        })
    },
}
