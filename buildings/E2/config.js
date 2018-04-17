const config = {
  title: 'Engineering 2 Building',
  browserTitle: 'E2 Map',
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

module.exports = helper([ 'B', '1', '2', '3' ], config);
