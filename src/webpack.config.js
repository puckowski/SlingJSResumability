const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
var path = require('path');

let dir = __dirname;

const lastForward = dir.lastIndexOf('/');
const lastBackward = dir.lastIndexOf('\\');

if (lastForward > lastBackward) {
    dir = dir.substring(0, dir.lastIndexOf('/'));
    dir = path.join(dir, 'dist');
} else {
    dir = dir.substring(0, dir.lastIndexOf('\\'));
    dir = path.join(dir, 'dist');
}

var config = {
    performance: {
        maxAssetSize: 5000000,
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist_frontend'),
        },
    },
    context: __dirname + '/dist_frontend',
    entry: path.join(__dirname, 'dist_frontend'),
    output: {
        path: path.join(dir, 'dist_frontend'),
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                ecma: undefined,
                warnings: false,
                parse: {},
                compress: {},
                mangle: true,
                module: false,
                output: null,
                toplevel: false,
                nameCache: null,
                ie8: false,
                keep_classnames: undefined,
                keep_fnames: false,
                safari10: false
            },
            extractComments: true,
        })],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: './*.html', to: '' },
                { from: './images', to: 'images' },
                { from: './css', to: '' },
            ]
        }),
    ],
    mode: 'production'
};

module.exports = config;
