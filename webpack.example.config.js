const path = require("path")
const Dotenv = require('dotenv-webpack');


module.exports = {
    target: "node",
    mode: "development",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "example.bundle.js",
        libraryTarget: 'commonjs',
    },
    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.m?(ts|js)$/,
                exclude: /node_modules/,
                loader: "eslint-loader"
            },
            {
                test: /\.m?(ts|js)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            },
            {
                test: /\.ts$/,
                loader: 'unlazy-loader'
            }
        ]
    },
    plugins: [
        new Dotenv()
    ],
    externals: ['pg', 'sqlite3', 'tedious', 'pg-hstore'],
    stats: {
        warnings: false
    }
}