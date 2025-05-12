const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        background: './src/background/background.ts',
        content: './src/content/index.ts',
        popup: './src/popup/popup.ts'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/popup/popup.html',
            filename: 'popup.html',
            chunks: ['popup']
        }),
        // new HtmlWebpackPlugin({
        //     template: './src/options/index.html',
        //     filename: 'options.html',
        //     chunks: ['options']
        // }),
        new CopyWebpackPlugin({
            patterns: [
                {from: 'manifest.json', to: '.'},
                {from: 'src/asserts', to: '.'}
            ]
        })
    ]
};
