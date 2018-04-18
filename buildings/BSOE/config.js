const config = {
  title: 'Baskin Engineering Building',
  browserTitle: 'E2 Map',
  suggestE2: true,
  bounds: [ [ 0, 0 ], [ 900, 1200 ] ],
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
    }, {
      label: 'Student Lounge',
      pos: [ 600, 735 ],
      floor: 1,
      classes: [],
    }, {
      label: 'Perk Coffee',
      pos: [ 522, 734 ],
      floor: 1,
      classes: [],
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
