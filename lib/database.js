var Sequelize = require('sequelize'),
    sequelize = {};

module.exports = {
    connect: function(data) {
        sequelize[data.id] = new Sequelize(data.database, data.username, data.password, {
            host: data.server,
            port: data.port,
        });

        return sequelize[data.id].authenticate();
    },

    getTables: function(data) {
        return sequelize[data.id].getQueryInterface().showAllTables();
    },

    getTableInfo: function(data) {
        return sequelize[data.id].getQueryInterface().describeTable(data.table);
    },

    getTableData: function(data) {
        var model = sequelize[data.id].define(data.table, data.attributes, {
            tableName: data.table,
            timestamps: false,
            freezeTableName: true
        });

        return model.findAll({
            limit: data.limit,
        });
    },
};
