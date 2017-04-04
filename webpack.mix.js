let mix = require('laravel-mix');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { resolve } = require('path');
const options = {
    postCss: [require('autoprefixer')],
    publicPath: 'dist',
};
const webpackConfig = {
    externals: {
        'mysql': 'require("mysql")',
    },
    resolve: {
        alias: {
            '~': resolve(__dirname, 'src'),
        },
    },
    plugins: [new HtmlWebpackPlugin({
        template: resolve(__dirname, 'src/index.html'),
        inject: false,
    })],
};

mix.options(options).webpackConfig(webpackConfig).js('src/js/main.js', 'dist');
