#!/bin/sh

publicPath=`basename $PWD`
../../node_modules/.bin/webpack-dev-server --open-page=${publicPath}/