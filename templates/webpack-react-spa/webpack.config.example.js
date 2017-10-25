const webpackMerge = require('webpack-merge');
const globalConfig = require('../../compiler/webpack.config');

module.exports = function (env, args) {
    return webpackMerge({}, globalConfig(env, args), {
        // your project webpack config
    });
};