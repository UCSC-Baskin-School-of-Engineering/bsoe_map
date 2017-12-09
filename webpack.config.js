const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

console.log(`Compiling ${process.env.NODE_ENV} build...`);

const sharedPlugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    },
  }),

  new HtmlWebpackPlugin(Object.assign({
    template: path.resolve(__dirname, 'src', 'index.html'),                   
  }, process.env.NODE_ENV === 'production' ? {
    minify: {
      collapseWhitespace: true,
      preserveLineBreaks: true,
      minifyJS: true,
    },
  } : {})),

  new ExtractTextPlugin({
    filename: '[contenthash].css',
    // filename: 'style.css',
    allChunks: true,
    disable: process.env.NODE_ENV === 'development',
  }),
];

const shared = {
  module: {
    rules: [{
      test: /\.js$/,
      loaders: ['babel-loader?presets[]=env,presets[]=stage-0'],
      include: path.resolve(__dirname, 'src'),
    }, {
      test: /\.s?css$/,
      loaders: ExtractTextPlugin.extract({ fallback: 'style-loader', use: ['css-loader', 'sass-loader'] }),
      include: path.resolve(__dirname, 'src'),
    }, {
      test: /\.(gif|jpe?g|png|svg|pdf)$/,
      loader: 'url-loader',
      query: {
        name: 'assets/[name].[ext]',
        limit: 5000,
      },
      // include: path.resolve(__dirname, 'src'),
    }],
  },
};

const config = process.env.NODE_ENV === 'production' ? {
  ...shared,
  entry: {
    main: './src/index.js',
  },
  output: {
    path: path.resolve('Y://htdocs'),
    filename: '[name].[chunkhash].js',
    publicPath: './',
  },
  plugins: [

    ...sharedPlugins,

    new webpack.optimize.OccurrenceOrderPlugin(),
    
    new UglifyJsPlugin({
      parallel: true,
    }),
    
    new CleanWebpackPlugin([ 'Y://htdocs/*.js', 'Y://htdocs/*.css', 'Y://htdocs/*.html' ], {
      allowExternal: true,
      verbose: true,
    }),
    
    // CommonsChunkPlugin: vendor must come before runtime
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor',
    //   minChunks: ({ resource }) => /node_modules/.test(resource),
    // }),
    
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'runtime',
    // }),
  ],
} : {
  ...shared,
  devtool: 'eval-source-map',
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:8080',
    'webpack/hot/only-dev-server',
    './src/index.js',
  ],
  plugins: [
    new webpack.NamedModulesPlugin(),
    
    new webpack.HotModuleReplacementPlugin(),

    ...sharedPlugins,
  ],
};

module.exports = config;
