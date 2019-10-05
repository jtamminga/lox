var path = require('path');

module.exports = {
    mode: 'development',
    // Change to your "entry-point".
    entry: './src/lox',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'lox.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        rules: [{
            // Include ts, tsx, js, and jsx files.
            test: /\.(ts|js)x?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }],
    },
    target: "node"
};