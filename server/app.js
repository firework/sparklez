var app = require('express')(),
    database = require('./../lib/database');

app.use(require('body-parser').json());
app.use(require('cors')());

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.post('/connect', function (req, res) {
    var data = req.body;

    database.connect(data).then(function(errors) {
        res.send({
            status: 'OK',
        });
    }).catch(function(errors) {
        console.log(errors);

        res.send({
            status: 'ERROR',
            message: 'Wrong credentials, please try again.',
        });
    });
});

app.post('/tables', function (req, res) {
    var data = req.body;

    database.getTables(data).then(function(tables) {
        res.send({
            tables: tables,
        });
    });
});

app.post('/table', function (req, res) {
    var data = req.body;

    database.getTableInfo(data).then(function(attributes) {
        res.send({
            attributes: attributes,
        });
    });
});

app.post('/rows', function (req, res) {
    var data = req.body;

    database.getTableData(data).then(function(rows) {
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
