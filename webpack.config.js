const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

let buildingConfig;
try {
  buildingConfig = require(`./buildings/${process.env.BUILDING}/config.json`);
} catch(_) {
  throw `Failed to find building config file: "./buildings/${process.env.BUILDING}/config.json".
  Did you export a valid BUILDING environment variable?`;
}

console.log(`Compiling ${process.env.NODE_ENV} build...`);

let sassVars = '';
if (buildingConfig.theme) {
  for (const key in buildingConfig.theme) {
    sassVars += `$${key}:${buildingConfig.theme[key]};`;
  }
}

const sharedPlugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      BUILDING: JSON.stringify(process.env.BUILDING),
    },
  }),

  new HtmlWebpackPlugin(Object.assign({
    template: path.resolve(__dirname, 'src', 'index.html'),
    title: buildingConfig.title,
    browserTitle: buildingConfig.browserTitle,
  }, process.env.NODE_ENV === 'production' ? {
    minify: {
      collapseWhitespace: true,
      preserveLineBreaks: true,
      minifyJS: true,
    },
  } : {})),

  new ExtractTextPlugin({
    filename: '[contenthash].css',
    allChunks: true,
    disable: process.env.NODE_ENV === 'development',
  }),
];

const shared = {
  module: {
    rules: [ {
      test: /\.js$/,
      loaders: [ 'babel-loader?presets[]=env,presets[]=stage-0' ],
      include: path.resolve(__dirname, 'src'),
    }, {
      test: /\.s?css$/,
      loaders: ExtractTextPlugin.extract({ fallback: 'style-loader', use: [
        'css-loader',
        { loader: 'sass-loader', options: {
          data: sassVars,
        } },
      ] }),
      include: path.resolve(__dirname, 'src'),
    }, {
      test: /\.(gif|jpe?g|png|svg|pdf)$/,
      loader: 'url-loader',
      query: {
        name: 'assets/[name].[ext]',
        limit: 5000,
      },
      // include: path.resolve(__dirname, 'src'),
    } ],
  },
};

let config;
if (process.env.NODE_ENV === 'production') config = { // PRODUCTION

  ...shared,

  entry: {
    main: './src/index.js',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].js',
    publicPath: './',
  },

  plugins: [

    ...sharedPlugins,

    new webpack.optimize.OccurrenceOrderPlugin(),
    
    new UglifyJsPlugin({
      parallel: true,
    }),

    new CleanWebpackPlugin([ 'dist' ]),

    new OptimizeCssAssetsPlugin({
      cssProcessorOptions: { discardComments: { removeAll: true } },
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
};
else if (process.env.NODE_ENV === 'development') config = { // DEVELOPMENT

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

  devServer: {
    hot: true,
    port: 8080,
  },

};
else throw 'Must set NODE_ENV to production or development';

module.exports = config;
