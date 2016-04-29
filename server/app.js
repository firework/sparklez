var app = require('express')(),
    database = require('./../lib/database');

app.use(require('body-parser').json());
app.use(require('cors')());

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.post('/connect', function (req, res) {
    var data = req.body;

    database.connect(data).then(function(response) {
        res.send(response);
    });
});

app.post('/tables', function (req, res) {
    var data = req.body;

    database.getTables(data).then(function(response) {
        res.send(response);
    });
});

app.post('/table', function (req, res) {
    var data = req.body;

    database.getTableInfo(data).then(function(response) {
        res.send(response);
    });
});

app.post('/rows', function (req, res) {
    var data = req.body;

    database.getTableData(data).then(function(response) {
        res.send(response);
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
