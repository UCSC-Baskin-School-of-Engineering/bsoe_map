const config = {
  title: 'Engineering 2 Building',
  browserTitle: 'E2 Map',
  startZoom: -0.80,
  theme: {
    primary: '',
    secondary: '',
  },
  quicknav: [
    {
      label: 'Entrance',
      pos: [ 300, 745 ],
      floor: 1,
      classes: [ 'primary' ],
    },
  ],
};

const helper = (floors, config) => {
  if (typeof window === 'undefined')
    return config;
    
  config.floors = floors;
  config.floorRooms = [];
  config.floorSvgs = [];
  for (const floor of floors) {
    config.floorRooms.push(require(`./floor${floor}.json`));
    config.floorSvgs.push(require(`./floor${floor}.svg`));
  }
  return config;
};

module.exports = helper([ '1', '2', '3', '4', '5' ], config);
