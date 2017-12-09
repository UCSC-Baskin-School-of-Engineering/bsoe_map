const $searchForm = document.getElementById('search');

const MAX_FLOOR = 3;

const getFirstNum = (str) => {
  const match = str.match(/\d+/);

  if (match) {
    const num = parseInt(match[0]);
    if (typeof num === 'number' && !isNaN(num)) {
      return num;
    }
  }

  return null;
};

const getText = (str) => {
  const match = str.match(/\w{3,}/);
  if (match) {
    return match[0];
  }

  return null;
};

const search = (str) => {

  const num = getFirstNum(str);
  const hasFloor = /\b(floor|level|flor)\b/i.test(str);

  if (num !== null) {
    if (hasFloor) {
      if (num >= 0 && num <= MAX_FLOOR) {
        return ['floor', num];
      }
    } else {
      return ['room', num];
    }
  }

  const hasBasement = /\b(b|base|basement|bottom)\b/i.test(str);
  
  if (hasFloor && hasBasement) {
    return ['floor', 0];
  }

  const text = getText(str);
  if (text) {
    return ['text', text];
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


