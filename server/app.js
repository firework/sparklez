var app = require('express')(),
    Sequelize = require('sequelize'),
    sequelize;

app.use(require('body-parser').json());
app.use(require('cors')());

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/connect', function (req, res) {
    var data = req.body;

    sequelize = new Sequelize(data.database, data.username, data.password, {
        host: data.server,
        port: data.port
    });

    sequelize.authenticate().then(function(errors) {
        res.send({
            status: 'OK',
        });
    }).catch(function(errors) {
        res.send({
            status: 'ERROR',
            message: 'Wrong credentials, please try again.',
        });
    });
});

app.get('/tables', function (req, res) {
    sequelize.getQueryInterface().showAllTables().then(function(tables) {
        res.send({
            tables: tables,
        });
    });
});

app.post('/table', function (req, res) {
    var data = req.body;

    sequelize.getQueryInterface().describeTable(data.table).then(function(attributes) {
        res.send({
            attributes: attributes,
        });
    });
});

app.post('/rows', function (req, res) {
    var data = req.body;

    var model = sequelize.define(data.table, data.attributes, {
        tableName: data.table,
        timestamps: false,
        freezeTableName: true
    });

    model.findAll({
        limit: data.limit,
    }).then(function(rows) {
        res.send({
            rows: rows.map(function(row) {
                return row.toJSON();
            }),
        });
    });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
