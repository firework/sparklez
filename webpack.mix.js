let mix = require('laravel-mix')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const options = {
    postCss: [require('autoprefixer')],
    publicPath: 'dist',
    resourceRoot: '',
}
const webpackConfig = {
    externals: {
        mysql: 'require("mysql")',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: `${__dirname}/src/index.html`,
            inject: false,
        }),
    ],
    resolve: {
        alias: {
            '~': `${__dirname}/src`,
        },
    },
}

mix
    .options(options)
    .webpackConfig(webpackConfig)
    .copy('src/electron.js', 'dist')
    .copy('src/package.json', 'dist')
    .js('src/js/main.js', 'dist')
