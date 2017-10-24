const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackDashboardPlugin = require('webpack-dashboard/plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const webpackMerge = require('webpack-merge');
const SpritesmithPlugin = require('webpack-spritesmith');
const projectName = `/${path.basename(process.cwd())}/`;

const extractCss = new ExtractTextWebpackPlugin({
    filename: '[name]-[hash].css',
    allChunks: true
});
const extractLess = new ExtractTextWebpackPlugin({
    filename: '[name]-[hash].css',
    allChunks: true
});
const extractSass = new ExtractTextWebpackPlugin({
    filename: '[name]-[hash].css',
    allChunks: true
});
const spritePlugin = new SpritesmithPlugin({
    src: {
        cwd: path.resolve(__dirname, 'src/images'),
        glob: '*.png'
    },
    target: {
        image: path.resolve(__dirname, `build/public/${projectName}/sprite.png`),
        css: path.resolve(__dirname, 'src/sprite/sprite.less')
    },
    apiOptions: {
        cssImageRef: "~sprite.png"
    },
    retina: {
        targetImage:path.resolve(__dirname, `build/public/${projectName}/sprite.png`),
        cssImageRef: "~sprite@2x.png"
    }
});

const defaultConfig = {
    entry: [
        path.resolve(process.cwd(), 'src/index.js')
    ],
    devtool: 'cheap-module-eval-source-map',
    module: {
        rules: [
            {
                test: /\.js?/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['react', 'es2015', 'stage-0', 'env'],
                        plugins: ['transform-class-properties']
                    }
                }
            },
            {
                test: /\.css$/,
                use: extractCss.extract(['css-loader', 'postcss-loader'])
            },
            {
                test: /\.scss$/,
                use: extractLess.extract(['css-loader', 'sass-loader'])
            },
            {
                test: /\.less$/,
                use: extractLess.extract(['css-loader', 'less-loader'])
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                use: [{
                    loader: 'file-loader'
                }]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name]-[hash].[ext]'
                    }
                }]
            }
        ]
    },
    plugins: [
        extractCss,
        extractLess,
        extractSass,
        spritePlugin
    ],
    devServer: {
        compress: true,
        port: 9000,
        hot: true
    }
};

const htmlWebpackPluginConfig = {
    template: path.join(process.cwd(), 'src/index.html'),
    filename: path.join(__dirname, `build/public/${projectName}/index.html`),
    inject: 'body'
}

/**
 *
 * @param env   webpack环境变量，命令行参数--env值
 * @param argv  webpack命令行参数
 * @param conf  项目自定义配置
 * @returns {{devtool: string, entry: [string,string,string], output: {path: (*|string), filename: string, publicPath: string}, plugins: [*,*,*,*], module: {rules: [*,*,*,*,*]}, resolve: {modules: [*,string]}}}
 */
module.exports = function (env, argv) {
    env = env || 'dev';
    var entry = [
        //'eventsource-polyfill', // necessary for hot reloading with IE
        //'webpack-hot-middleware/client'
    ], plugins = [
        //new webpack.optimize.CommonsChunkPlugin(),
        /**
         * This is a webpack plugin that simplifies creation of HTML files to serve your
         * webpack bundles. This is especially useful for webpack bundles that
         * include a hash in the filename which changes every compilation.
         */
        new HtmlWebpackPlugin(htmlWebpackPluginConfig),
        /**
         * DefinePlugin allows us to define free variables, in any webpack build, you can
         * use it to create separate builds with debug logging or adding global constants!
         * Here, we use it to specify a development build.
         */
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env)
        })
    ];

    switch (env) {
        case 'prod':
            plugins = plugins.concat([
                /**
                 * This plugin assigns the module and chunk ids by occurence count. What this
                 * means is that frequently used IDs will get lower/shorter IDs - so they become
                 * more predictable.
                 */
                new webpack.optimize.OccurenceOrderPlugin(),
                /**
                 * Some of you might recognize this! It minimizes all your JS output of chunks.
                 * Loaders are switched into a minmizing mode. Obviously, you'd only want to run
                 * your production code through this!
                 */
                new webpack.optimize.UglifyJsPlugin({
                    compressor: {
                        warnings: false
                    }
                })
            ]);
            break;
        case 'dev':
        default:
            plugins = plugins.concat([
                /**
                 * This is where the magic happens! You need this to enable Hot Module Replacement!
                 */
                new webpack.HotModuleReplacementPlugin(),
                /**
                 * NoErrorsPlugin prevents your webpack CLI from exiting with an error code if
                 * there are errors during compiling - essentially, assets that include errors
                 * will not be emitted. If you want your webpack to 'fail', you need to check out
                 * the bail option.
                 */
                new webpack.NoEmitOnErrorsPlugin(),
                new WebpackDashboardPlugin()
            ]);
            break;
    }

    return webpackMerge({}, defaultConfig, {
        devtool: env === 'prod' ? 'source-map' : 'cheap-module-eval-source-map',
        entry: env === 'prod' ? [] : entry,
        output: {
            path: path.join(__dirname, `build/public/${projectName}`),
            filename: '[name]-[hash].js',
            publicPath: projectName
        },
        plugins: plugins,
        resolve: {
            modules: [
                path.resolve(process.cwd(), 'node_modules'),
                '../node_modules',
                path.resolve(__dirname, '../projects'),
                path.resolve(__dirname, '../projects/**/src')
            ]
        },
        devServer: {
            contentBase: path.join(__dirname, `build/public`),
            publicPath: projectName
        }
    });
}
