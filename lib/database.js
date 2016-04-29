var Sequelize = require('sequelize'),
    sequelize = {},
    catchFunc = function(error) {
        resolve({
            status: 'ERROR',
            message: error.message,
        });
    };

module.exports = {
    connect: function(data) {
        sequelize[data.id] = new Sequelize(data.database, data.username, data.password, {
            host: data.server,
            port: data.port,
            logging: console.log.bind(console),
        });

        return new Promise(function(resolve, reject) {
            sequelize[data.id].authenticate().then(function() {
                console.log('OK');
                resolve({
                    status: 'OK',
                });
            }).catch(function(error) {
                console.log(error);
                resolve({
                    status: 'ERROR',
                    message: error.message,
                });
            });
        });
    },

    getTables: function(data) {
        return new Promise(function(resolve, reject) {
            sequelize[data.id].getQueryInterface().showAllTables().then(function(tables) {
                resolve({
                    status: 'OK',
                    tables: tables,
                });
            }).catch(catchFunc);
        });
    },

    getTableInfo: function(data) {
        return new Promise(function(resolve, reject) {
            sequelize[data.id].getQueryInterface().describeTable(data.table).then(function(attributes) {
                resolve({
                    status: 'OK',
                    attributes: attributes,
                });
            }).catch(catchFunc);
        });
    },

    getTableData: function(data) {
        return new Promise(function(resolve, reject) {
            var model = sequelize[data.id].define(data.table, data.attributes, {
                tableName: data.table,
                timestamps: false,
                freezeTableName: true
            });

            model.findAll({
                limit: data.limit,
            }).then(function(rows) {
                resolve({
                    rows: rows.map(function(row) {
                        return row.toJSON();
                    }),
                });
            }).catch(catchFunc);
        });
    },
};
