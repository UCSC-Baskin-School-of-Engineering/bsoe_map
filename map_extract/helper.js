const fs = require('fs');
const cheerio = require('cheerio');

const fileContent = fs.readFileSync('./svg/floorB.svg');

const $ = cheerio.load(fileContent, {
  xmlMode: true,
  normalizeWhitespace: true,
});

const $root = $('svg').first();

const $children = $('svg > g');

$children.each((i, el) => {
  console.log(el.attribs.id);
});

// cont result = $.xml();
// fs.writeFileSync('./output.svg', result);
