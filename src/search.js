// Convert string to int
const toInt = str => {
  const num = parseInt(str);
  if (typeof num === 'number' && !isNaN(num)) {
    return num;
  }
  return null;
};

// Get room or text from searched string
const search = (str) => {

  let match = str.match(/(e?)(\d+)[a-z]{0,2}\d?\b/i);
  
  if (match) {

    const roomNum = toInt(match[2]);
    if (roomNum !== null) {
      return {
        type: match[1] ? 'E2' : 'room',
        floor: Math.floor(roomNum / 100),
        raw: str,
        room: match[0].toUpperCase(),
      };
    }
  }

  // TODO
  match = str.match(/[a-zA-Z\s-]{3,}/);
  if (match) {
    const text = match[0];
    return {
      type: 'text',
      raw: str,
      text: text.trim().split(/\s+/).join(' ').toUpperCase(),
    };
  }
  
  return {
    raw: str,
  };
};

export default ($searchForm, goTo) => {
  $searchForm.onsubmit = (e) => {
    e.preventDefault();
    const searchString = e.target[0].value;
    
    goTo(search(searchString));
  };
};


