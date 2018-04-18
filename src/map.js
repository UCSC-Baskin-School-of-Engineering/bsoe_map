import L from 'leaflet';

import search from './search';
const {
  floors, floorRooms, floorSvgs, quicknav, suggestE2, startZoom = -0.78,
} = require(`../buildings/${process.env.BUILDING}/config.js`);

// DOM elements
const $parent = document.getElementById('map');
const $quicknav = document.getElementById('quicknav');
const $floorTitle = document.getElementById('floor-title');
const $searchError = document.getElementById('search-error');
const $searchE = document.getElementById('search-e');
const $floorButtons = document.getElementById('floor-buttons');
const $searchFields = document.querySelectorAll('#search input');
document.querySelector('#search-error .delete').onclick = () => $searchError.classList.add('is-off');
document.querySelector('#search-e .delete').onclick = () => $searchE.classList.add('is-off');

// Constants
const bounds = [ [ 0, 0 ], [ 900, 1200 ] ];
const startCoords = L.latLng((bounds[1][0] - bounds[0][0]) / 2, (bounds[1][1] - bounds[0][1]) / 2);
const polylineOptions = {
  color: 'red',
  weight: 3,
  opacity: .5,
  dashArray: '5,5',
  lineJoin: 'round',
};
const locationNames = {};

// Layers
const locationPop = L.popup({ closeButton: false });
const locationLayer = new L.Polyline([], polylineOptions);

// Create array of floor layers that contain room number markers
const floorLayers = floorSvgs.map((floor, i) => {
  const floorLayer = L.imageOverlay(floor, bounds);

  const rooms = floorRooms[i];

  const markers = Object.keys(rooms).map(text => {
    
    const room = rooms[text];

    const roomMarker = L.marker([
      room.y * bounds[1][0],
      room.x * bounds[1][1],
    ], {
      icon: L.divIcon({
        iconSize: new L.Point(0, 0),
        className: 'room-label',
        html: `<div>${text}</div>`,
      }),
    });
    rooms[text] = roomMarker;

    return roomMarker;
  });

  return L.layerGroup([ floorLayer, ...markers ]);
});

// Setup leaflet settings
const map = L.map($parent, { // Bind map to element with id 'map'
  crs: L.CRS.Simple,
  maxBounds: bounds,
  minZoom: startZoom,
  maxZoom: 1.5,
  attributionControl: false,
  zoomSnap: 0.1,
});

// TEMP debug
map.on('click', (e) => {
  console.log('click at:', e.latlng);
});

// Resize room labels on zoom
map.on('zoom', () => {
  const z = map.getZoom();
  if (z < 0.4) {
    $parent.classList.add('zoomed-out');
  } else {
    $parent.classList.remove('zoomed-out');
  }
});

let currentFloor;

// Display image of floor layouts
const setFloor = index => {

  locationPop.remove();

  const newFloor = floorLayers[index];

  if (!newFloor) return;

  if (currentFloor) map.removeLayer(currentFloor);
  currentFloor = newFloor.addTo(map);

  // Highlight corresponding floor button
  $floorButtons.childNodes.forEach((el, i) => {
    if (floorLayers.length - 1 - i === index) el.classList.add('is-active');
    else el.classList.remove('is-active');
  });

  // Update title
  $floorTitle.textContent = `Floor ${floors[index]}`;
};

// Fly to designated room
const goToRoom = (floor, room) => {
  
  setFloor(floor);
  
  const roomMarker = floorRooms[floor][room];
  
  if (roomMarker) {
    const latlng = roomMarker.getLatLng();

    locationPop
    .setLatLng(latlng)
    .setContent(`<h1>Room ${room}</h1>`)
    .addTo(map);

    map.setView(latlng, 0.4);
  }
};

// Reset map to 1st floor and initial zoom level
const reset = (coords) => {
  setFloor(1);
  
  map.setView(coords || startCoords, startZoom);
  map.removeLayer(locationPop);
  map.removeLayer(locationLayer);
};

// Function factory for zooming to given coords and showing popup
const createDirections = (floor, coords, content, points) => () => {

  setFloor(floor);

  if (points) {
    locationLayer.setLatLngs(points.map(latlng => new L.LatLng(latlng[0], latlng[1])));
    map.fitBounds(locationLayer.getBounds().pad(.1));
    map.addLayer(locationLayer);
  }

  if (coords) {
    locationPop
    .setLatLng(coords)
    .setContent(content)
    .addTo(map);

    map.setView(coords, 0.4);
  }
};

// Iterate over quicknav.json and add buttons for each location
for (const nav of quicknav) {
  const $el = document.createElement('button');
  $el.classList.add('button', 'is-fullwidth', 'is-medium', 'is-link', 'is-outlined', ...nav.classes);
  $el.innerText = nav.label;
  $el.onclick = createDirections(nav.floor, nav.pos, `<h1>${nav.label}</h1>`, nav.points);

  $quicknav.appendChild($el);

  // Create searchable quicknav object
  locationNames[nav.label.toUpperCase()] = $el.onclick;
}

for (let i = floors.length - 1; i >=0; i--) {
  const $el = document.createElement('button');
  $el.classList.add('button', 'is-fullwidth', 'is-large', 'is-primary');
  $el.innerText = `Floor ${floors[i]}`;
  $el.onclick = () => setFloor(i);

  $floorButtons.appendChild($el);
}

// Bind reset button
document.getElementById('reset').onclick = () => reset();

// Bind actions to the search action
search((res) => {
  
  console.log('searchResult:', res);

  // Reset search fields and error messages
  $searchFields.forEach(el => el.classList.remove('is-danger'));
  $searchError.classList.add('is-off');
  $searchE.classList.add('is-off');

  // Find room or location
  if (res.type === 'room') {
    const floor = floorRooms[res.floor];
    if (floor && floor.hasOwnProperty(res.room)) {
      return goToRoom(res.floor, res.room);
    }
  } else if (res.type === 'text') {
    const navAction = locationNames[res.text];
    if (navAction) {
      return navAction();
    }
  }

  console.error('Failed to find :', res.raw);

  // Enable search field error and error message
  $searchFields.forEach(el => el.classList.add('is-danger'));
  if (suggestE2 && res.type === 'E2') {
    $searchE.classList.remove('is-off');
    $searchE.querySelector('a').href = '/E2#' + res.room.substring(1);
  } else $searchError.classList.remove('is-off');
});

// Reset on startup
reset();

const triggerEvent = (el, eventName) => {
  try {
    const event = document.createEvent('HTMLEvents');
    event.initEvent(eventName, true, true);
    event.eventName = eventName;
    el.dispatchEvent(event);
  } catch(_) {
    // Just don't do anything
  }
};

// Allow searching on page load
const hash = window.location.hash.substring(1);
if (hash) {
  const $search = document.getElementById('search');
  $search.elements[0].value = hash;
  triggerEvent($search, 'submit');
}

// Remove map and event listeners from DOM
export const destroy = () => {
  map.remove();

  while ($quicknav.firstChild) {
    $quicknav.removeChild($quicknav.firstChild);
  }
};
