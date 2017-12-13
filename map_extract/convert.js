/*
  This file servers to convert a dxf to an svg,
  filter out unwanted layers, modify colors, and store
  room numbers in a .json file
*/

const dxf = require('dxf');
const fs = require('fs');
const Svgo = require('svgo');
const { promisify } = require('util');
const createSVG = require('./createSVG');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const ifile = process.argv[2],
      odir = process.argv[3];

if (!ifile || !odir) {
  console.log('Usage: node convert.js <input_file.dxf> <output_directory>');
  process.exit(1);
}

// Store room data
const roomData = {};

// Helper function to reset an entities color
// note: dxf uses 8bit color http://sub-atomic.com/~moses/acadcolors.html
const setColor = color => e => {
  e.colorNumber = color;
  return true;
};

const layerActions = {

  'A-COLS': setColor(252),
  'A-FLOR-HRAL': setColor(250),
  'A-GLAZ': setColor(141),
  
  'A-WALL-FULL': true,
  'A-FLOR-STRS': true,
  'A-FLOR-TPTN': true,
  'A-WALL-PRHT': true,
  'A-WALL-FNCE': true,
  'A-WALL': true,
  'A-AREA': true,
  'A-FLOR-LEVL': true,

  'A-FLOR-STKS': false,
  'A-AREA-IDEN': false,
  'A-AREA-IDEN-UCSC': false,
  'A-ANNO-MTLB': false,
  'T-WIFI-WAPS': false,
  'A-FURN': false,
  'A-FLOR-EVTR': false,
  'A-CTRL': false,
  'A-FLOR-PFIX': false,
  'A-WALL-PRTN': false,
  'A-EQPM': false,
  'A-FLOR': false,
  'A-DOOR': false,
  
};

const normalize = (val, in_min, in_max) => {
  return (val - in_min) / (in_max - in_min);
};

const matchRoom = /^(\[(\w+)\])?0*(\d+([a-z]*)\d*)$/i;
const invalidRoomLabel = /^(BG|CG|NC|SA|XX)$/;
// Add a new room if it is valid
const addRoom = ({ string, x, y }, bbox) => {
  const match = string.match(matchRoom);
  
  if (!match || // No rooms that don't match matchRoom
    match[4] === 'S' || // No staircase rooms
    invalidRoomLabel.test(match[2])) { // No room labels matching invalidRoomLabel
    return;
  }

  roomData[`${match[3]}`] = {
    x: normalize(x, bbox.minX, bbox.maxX).toFixed(6),
    y: normalize(y, bbox.minY, bbox.maxY).toFixed(6),
  };
};

// Modify parsed data: filter certain layers, save room numbers
const parseEntities = async (parsed) => {
  
  // Filter entites by layer
  parsed.entities = parsed.entities.filter(entity => {
    const layer = entity.layer.toUpperCase();

    // Store room numbers
    if (entity.type === 'MTEXT' && layer === 'A-AREA-IDEN') {
      addRoom(entity, parsed.bbox);
    }
    
    // Each layerAction can be one of the following:
    // 1. false: remove entity
    // 2. true: keep entity,
    // 3. function: keep entity only if running function on entity returns true
    let res = layerActions[layer];
    if (typeof res === 'function') res = res(entity);

    return !!res;
  });
};

const filename = ifile.replace(/\.[^/.]+$/, '');

(async () => {
  // Read dxf data from input_file
  const rawDxf = await readFileAsync(ifile, 'utf8');

  // Parse dxf using 'dxf' module
  const parsed = dxf.parseString(rawDxf);

  // Calculate bounding box of dxf i.e. parsed.bbox
  await createSVG.parseBounds(parsed);

  // Modify parsed data: filter certain layers, save room numbers
  await parseEntities(parsed);

  // Convert parsed to svg
  const svg = await createSVG.toSVG(parsed);

  // Optimize svg
  const { data: optimized } = await new Svgo({}).optimize(svg);

  // Save svg and room data to output_directory
  await Promise.all([
    writeFileAsync(`${odir}/${filename}.svg`, optimized, { flag: 'w+' }),
    writeFileAsync(`${odir}/${filename}.json`, JSON.stringify(roomData, null, 2), { flag: 'w+' }),
  ]);

})()
.then(() => console.log(`Successfully converted "${filename}.dxf"`))
.catch(console.error);
