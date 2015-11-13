var Sequelize = require('sequelize'),
    SequelizeAuto = require('sequelize-auto'),
    sequelize = null,
    sequelizeAuto = null;

module.exports = Vue.extend({
    template: view('database'),

    data: function() {
        return {
            tables: [],
            tableActive: null,
            model: null,
            columns: [],
            rows: [],
        };
    },

    methods: {
        isTableActive: function(table) {
            return table == this.tableActive;
        },

        setTableActive: function(table) {
            this.model = require(sequelizeDir + '/' + table)(sequelize, Sequelize);

            var that = this,
                columns = Object.keys(this.model.attributes);

            that.model.findAll({
                attributes: columns, // this.columns,
            }).then(function(result) {
                var rows = [];

                for (x in result) {
                    rows.push(result[x].dataValues);
                }

                that.tableActive = table;
                that.columns = columns;
                that.rows = rows;
            });
        },
    },

    created: function() {
        var that = this;

        // Uncomment this if you don't want to connect to the database
        this.tables = ['table_1', 'table_2'];
        this.columns = ['col_1', 'col_2'];
        this.rows = [{col_1: 1, col_2: 'row 1'}, {col_1: 2, col_2: 'row 2'}];

        return;

        sequelize = new Sequelize('mysql://homestead:secret@localhost:33060/homestead'),
        sequelizeAuto = new SequelizeAuto('homestead', 'homestead', 'secret', {
            host: 'localhost',
            port: 33060,
        });

        sequelizeAuto.run({
            spaces: true,
            indentation: 4,
            directory: sequelizeDir,
            additional: {
                timestamps: false,
            }
        }, function(err){
            if (err) throw err;

            fs.readdir(sequelizeDir, function(err, files) {
                for (x in files) {
                    files[x] = files[x].replace('.js', '');
                }

                that.tables = files;
                that.setTableActive(files[0]);
            });
        });
    },
});
