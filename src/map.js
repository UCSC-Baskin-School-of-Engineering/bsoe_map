import L from 'leaflet';

import search from './search';
import floorB from './floors/floorB.svg';
import floor1 from './floors/floor1.svg';
import floor2 from './floors/floor2.svg';
import floor3 from './floors/floor3.svg';
import jsonB from './floors/floorB.json';
import json1 from './floors/floor1.json';
import json2 from './floors/floor2.json';
import json3 from './floors/floor3.json';

// const mapNum = (val, fromMin, fromMax, toMin, toMax) => {
//   return (val - fromMin) / (fromMax - fromMin) * (toMax - toMin) + toMin;
// };

// Constants
const startZoom = -0.78;
const entrance = [1623,768];
const bounds = [[0,0], [1200,1200]];
const polylineOptions = {
  color: 'red',
  weight: 3,
  opacity: .5,
  dashArray: '5,5',
  lineJoin: 'round',
};
const floorRooms = [ jsonB, json1, json2, json3 ];

const floorLayers = [ floorB, floor1, floor2, floor3 ].map((floor, i) => {
  const floorLayer = L.imageOverlay(floor, bounds);

  const rooms = floorRooms[i];

  const markers = Object.keys(rooms).map(text => {
    const icon = L.divIcon({
      iconSize: new L.Point(0, 0),
      className: 'room-label',
      html: `<div>${text}</div>`,
    });
    const room = rooms[text];
    // console.log(room[0], room[1]);
    return L.marker(room, { icon });
    // const [lat, lng] = rooms[text];
    // return L.marker([
    //   mapNum(lat, 14759.06, 16132.54, 440, 790),
    //   mapNum(lng, -9655.74, -6228.27, 150, 980),
    // ], { icon });
  });

  return L.layerGroup([floorLayer, ...markers]);
});

let currentFloor;

// Display image of floor layouts
const setFloor = index => {

  console.log('setFloor:', index);
  const newFloor = floorLayers[index];

  if (!newFloor) return;

  if (currentFloor) map.removeLayer(currentFloor)
  currentFloor = newFloor.addTo(map);

  document.querySelectorAll(`.floor-button`).forEach((el, i) => {
    if (floorLayers.length - 1 - i === index) el.classList.add('is-active');
    else el.classList.remove('is-active');
  });
};

const goToRoom = num => {
  
  const floor = Math.floor(num / 100);
  if (floor <= 3) setFloor(floor);
  else return;
  
  const rooms = floorRooms[floor];
  const room = rooms[num];
  if (room) {
    map.setView([room[0], room[1]], startZoom);
  }
};

// Setup leaflet settings
const map = L.map('map', { // Bind map to element with id 'map'
  crs: L.CRS.Simple,
  maxBounds: bounds,
  minZoom: startZoom,
  maxZoom: 1.5,
  attributionControl: false,
  zoomSnap: 0.1,
});

map.on('click', (e) => {
  console.log('click at:', e.latlng);
});

// Layers
const locationPop = L.popup({ closeButton: false });
const locationLayer = new L.Polyline([], polylineOptions);

const reset = coords => {
  setFloor(1);
  map.setView(coords || entrance, startZoom);
  map.removeLayer(locationPop);
  map.removeLayer(locationLayer);
};

const createDirections = (coords, content, points) => () => {

  if (points) {
    locationLayer.setLatLngs(points);
    map.fitBounds(locationLayer.getBounds().pad(.1));
    map.addLayer(locationLayer);
  } else {
    reset(coords);
  }

  if (coords) {
    locationPop
    .setLatLng(coords)
    .setContent(content)
    .addTo(map);
  }
};

// Map buttons (by id) to functions
const quickNav = {
  'go-entrance': createDirections(
    entrance,
    'Library Entrance'
  ),
  'go-lounge': createDirections(
    [1817, 577],
    '3rd Floor<br>Study<br>Rooms<br><a href="http://library.ucsc.edu/services/study-rooms">Reserve</a>',
    [
      new L.LatLng(1817, 577),
      new L.LatLng(2013, 173),
      new L.LatLng(2100, 434),
      new L.LatLng(1513, 434),
      new L.LatLng(1624, 768),
    ]
  ),
  'go-perk': createDirections(
    [1647, 427],
    'Global Village Cafe<br><a href="http://amazonjuicesgvc.com/index.html">Order Online</a>',
    [
      new L.LatLng(1647, 427),
      new L.LatLng(1696, 590),
      new L.LatLng(1624, 768),
    ]
  ),
  'reset': () => reset(),
};
for (let i = 0; i < floorLayers.length; i++) {
  quickNav[`floor${i}`] = () => setFloor(i);
}
for (let id in quickNav) {
  document.getElementById(id).addEventListener('click', quickNav[id]);
}

// Reset on startup
reset();
search((type, val) => {
  
  console.log('searchResult:', type, val);

  if (type === 'floor') {
    setFloor(val);
  } else if (type === 'room') {
    goToRoom(val);
  }
});

export const destroy = () => {
  map.remove();

  for (let id in quickNav) {
    document.getElementById(id).removeEventListener('click', quickNav[id]);
  }
};
