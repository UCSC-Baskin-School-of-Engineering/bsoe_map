const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const config = require('./webpack.config');

const PORT = 8080,
      URL = '0.0.0.0';

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  contentBase: config.output.path,
  hot: true,
  inline: true,
  historyApiFallback: true,
  stats: {
    colors: true,
    timings: true,
    hash: false,
    chunks: false,
    chunkModules: false,
    modules: false,
  },
}).listen(PORT, URL, (err) => {
  if (err) {
    return console.log(err);
  }
  
  return console.log(`Listening at http://${URL}:${PORT}/`);
});
