const $searchForm = document.getElementById('search');

const MAX_FLOOR = 3;

// Convert string to int
const toInt = str => {
  const num = parseInt(str);
  if (typeof num === 'number' && !isNaN(num)) {
    return num;
  }
  return null;
};

// Is floor in range [0,MAX_FLOOR]
const validFloor = (num) => (num >= 0 && num <= MAX_FLOOR);

// Get room or text from searched string
const search = (str) => {

  let match = str.match(/(\d+)[a-z]{0,2}\d?/i);
  
  if (match) {

    const roomNum = toInt(match[1]);
    if (roomNum !== null) {
      const floor = Math.floor(roomNum / 100);
      if (validFloor(floor)) {
        return [ 'room', floor, match[0] ];
      }
    }
  }

  // TODO
  match = str.match(/[\w\s]{3,}/);
  if (match) {
    const text = match[0].trim();
    return [ 'text', text ];
  }
  
  return [];
};

export default (goTo) => {
  $searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const searchString = e.target[0].value;
    
    goTo(...search(searchString));
  });
};


