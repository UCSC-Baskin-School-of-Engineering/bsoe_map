import L from 'leaflet';

import quicknav from './quicknav.json';
import search from './search';
import floorB from './floors/floorB.svg';
import floor1 from './floors/floor1.svg';
import floor2 from './floors/floor2.svg';
import floor3 from './floors/floor3.svg';
import jsonB from './floors/floorB.json';
import json1 from './floors/floor1.json';
import json2 from './floors/floor2.json';
import json3 from './floors/floor3.json';

// DOM elements
const $parent = document.getElementById('map');
const $quicknav = document.getElementById('quicknav');

// Constants
const startZoom = -0.78;
const entrance = [ 1623, 768 ];
const bounds = [ [ 0, 0 ], [ 900, 1200 ] ]; // must be 4:3 aspect ratio to match given dxf ratios
const polylineOptions = {
  color: 'red',
  weight: 3,
  opacity: .5,
  dashArray: '5,5',
  lineJoin: 'round',
};
const floorRooms = [ jsonB, json1, json2, json3 ];

// Layers
const locationPop = L.popup({ closeButton: false });
const locationLayer = new L.Polyline([], polylineOptions);

// Create array of floor layers that contain room number markers
const floorLayers = [ floorB, floor1, floor2, floor3 ].map((floor, i) => {
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

// TEMP
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

  console.log('setFloor:', index);
  const newFloor = floorLayers[index];

  if (!newFloor) return;

  if (currentFloor) map.removeLayer(currentFloor);
  currentFloor = newFloor.addTo(map);

  // Highlight corresponding floor button
  document.querySelectorAll(`.floor-button`).forEach((el, i) => {
    if (floorLayers.length - 1 - i === index) el.classList.add('is-active');
    else el.classList.remove('is-active');
  });
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
  map.setView(coords || entrance, startZoom);
  map.removeLayer(locationPop);
  map.removeLayer(locationLayer);
};

// DOMelement.onclick factory for zooming to given coords and showing popup
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
}

// Map buttons (by id) to functions
const buttonListeners = {
  reset: () => reset(),
};
for (let i = 0; i < floorLayers.length; i++) {
  buttonListeners[`floor${i}`] = () => setFloor(i);
}
for (const id in buttonListeners) {
  document.getElementById(id).onclick = buttonListeners[id];
}

// Reset on startup
reset();

// Bind actions to the search action
search((type, ...val) => {
  
  console.log('searchResult:', type, ...val);

  if (type === 'floor') {
    setFloor(...val);
  } else if (type === 'room') {
    goToRoom(...val);
  }
});

// Remove map and event listeners from DOM
export const destroy = () => {
  map.remove();

  while ($quicknav.firstChild) {
    $quicknav.removeChild($quicknav.firstChild);
  }
};
