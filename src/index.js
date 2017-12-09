import './style.scss';

let map = require('./map');

// Enable hot reloading
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./map', () => {
    map.destroy();
    map = require('./map');
  });
}
