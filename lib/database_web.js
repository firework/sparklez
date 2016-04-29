var Vue = require('Vue');

module.exports = {
    connect: function(data) {
        return new Promise(function(resolve, reject) {
            Vue.http.post('http://localhost:3000/connect', data).then(function(response) {
                resolve(response.data);
            });
        });
    },

    getTables: function(data) {
        return new Promise(function(resolve, reject) {
            Vue.http.post('http://localhost:3000/tables', data).then(function(response) {
                resolve(response.data);
            });
        });
    },

    getTableInfo: function(data) {
        return new Promise(function(resolve, reject) {
            Vue.http.post('http://localhost:3000/table', data).then(function(response) {
                resolve(response.data);
            });
        });
    },

    getTableData: function(data) {
        return new Promise(function(resolve, reject) {
            Vue.http.post('http://localhost:3000/rows', data).then(function(response) {
                resolve(response.data);
            });
        });
    },
};
