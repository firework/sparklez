let mix = require('laravel-mix')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const options = {
    postCss: [require('autoprefixer')],
    publicPath: 'dist',
    resourceRoot: `${__dirname}/dist/`,
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

mix.options(options).webpackConfig(webpackConfig).js('src/js/main.js', 'dist')
