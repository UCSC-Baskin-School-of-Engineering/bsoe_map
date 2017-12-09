const fs = require('fs');
const os = require('os');
const cheerio = require('cheerio');
const Svgo = require('svgo');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const svgo = new Svgo({});

const INPUT_PATH = './svg';
const OUTPUT_PATH = `../src/floors`;
const CHEERIO_OPTIONS = {
  xmlMode: true,
  normalizeWhitespace: true,
};

// const getBounds = $el => {
  
//   const nums = $el.attr('d').split(/[\sML]+/);
//   nums.shift();

//   let minX = 9999999, minY = 9999999,
//       maxX = 0, maxY = 0;
//   for (let i = 0; i < 4; i++) {
//     const x = parseFloat(nums[i * 4]),
//           y = parseFloat(nums[i * 4 + 1]);
//     if (x < minX) minX = x;
//     else if (x > maxX) maxX = x;
//     if (y < minY) minY = y;
//     else if (y > maxY) maxY = y;
//   }
  
//   return {
//     x: minX,
//     y: minY,
//     w: maxX - minX,
//     h: maxY - minY,
//   };
// };

// const bounds = getBounds(cheerio.load(fs.readFileSync(`./svg/floor1.svg`))('#A-ANNO-MTLB').children().eq(3).children().first());
// const bounds = { x: 47.36, y: 35.55, w: 705.28, h: 528.96 };
// const bounds = { x: 0, y: 0, w: 800, h: 600 };
// console.log('Bounds:', JSON.stringify(bounds));

const getBounds = ($paths) => {

  let minX = 9999999, minY = 9999999,
      maxX = 0, maxY = 0;

  $paths.each((i, el) => {
    const path = el.attribs.d;
    if (!path || path.length === 0) return;
    const nums = path.split(/[\sML]+/);
    nums.shift();

    if (nums.length === 16) {
      for (let i = 0; i < 4; i++) {
        const x = parseFloat(nums[i * 4]),
              y = parseFloat(nums[i * 4 + 1]);
        if (x < minX) minX = x;
        else if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        else if (y > maxY) maxY = y;
      }
    }
  });

  const bounds = {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY,
  };
  
  return bounds;
};

const removeIds = {
  // 'A-WALL-FULL': true,
  // 'A-GLAZ': true,
  // 'A-DOOR': true,
  // 'A-FLOR-HRAL': true,
  // 'A-FLOR-STRS': true,
  // 'A-EQPM': true,
  // 'A-FLOR': true,
  // 'A-FLOR-TPTN': true,
  // 'A-FLOR-PFIX': true,
  // 'A-FLOR-STKS': true,
  // 'A-WALL-PRHT': true,
  // 'A-FURN': true,
  // 'A-WALL-FNCE': true,
  // 'A-WALL-PRTN': true,
  // 'A-FLOR-EVTR': true,
  // 'A-COLS': true,
  // 'A-AREA-IDEN': true,
  'A-ANNO-MTLB': true,
  'T-WIFI-WAPS': true,
};

const allBounds = {};

const convert = ($, label) => {

  const $root = $('svg').first();
  const $children = $root.children();

  const bounds = getBounds($children.find('#A-ANNO-MTLB path, #a-anno-mtlb path'));
  allBounds[label] = bounds;
    
  $root.attr('viewBox', `${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}`);
  $root.removeAttr('width');
  $root.removeAttr('height');
  
  $children.filter((i, el) => {
    const id = el.attribs.id;
    return (el.tagName !== 'g' || !id || removeIds.hasOwnProperty(id.toUpperCase()));
  }).remove();
  
  return Promise.resolve($);
};


Promise.all(['B', 1, 2, 3].map(label =>
  readFileAsync(`${INPUT_PATH}/floor${label}.svg`)
  .then(content => cheerio.load(content, CHEERIO_OPTIONS))
  .then($ => convert($, label))
  .then($new => $new.xml())
  .then(newContent => svgo.optimize(newContent))
  .then(optimized => optimized.data)
  .then(newContent => {

    const outputPath = `${OUTPUT_PATH}/floor${label}.svg`;
    const KB = Buffer.byteLength(newContent, 'utf8') / 1000;
    console.log('Writing to:', outputPath, '\nSize:', KB.toFixed(3), 'KB');
    return writeFileAsync(outputPath, newContent);
    
  })
))
.then(() => writeFileAsync('./bounds.json', JSON.stringify(allBounds)))
.catch(console.error);
