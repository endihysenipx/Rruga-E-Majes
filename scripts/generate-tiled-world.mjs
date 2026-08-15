import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const MAP_WIDTH = 144;
const MAP_HEIGHT = 11;
const TILE = 48;
const OUTPUT = resolve('src/components/game/world/maps/gjeravica-world.json');

const tile = {
  meadow: 1,
  forest: 2,
  river: 3,
  cliff: 4,
  ruins: 5,
  mist: 6,
  snow: 7,
  soil: 8,
  stone: 9,
  snowStone: 10,
  pineTall: 11,
  pine: 12,
  bush: 13,
  goldFlowers: 14,
  whiteFlowers: 15,
  rock: 16,
  stump: 17,
  lantern: 18,
  mushrooms: 19,
  crystal: 20,
  pillar: 21,
  arch: 22,
  waterfall: 23,
  bridge: 24,
  campfire: 25,
  flag: 26,
  reeds: 27,
  deadPine: 28,
  ferns: 29,
  grass: 30,
};

const controls = [
  [0, 8], [12, 7], [28, 6], [41, 7], [47, 8], [56, 8], [63, 6],
  [75, 5], [87, 6], [99, 6], [110, 5], [123, 4], [135, 4], [143, 3],
];

function surfaceRow(column) {
  const rightIndex = controls.findIndex(([x]) => x >= column);
  if (rightIndex <= 0) return controls[0][1];
  const [x1, y1] = controls[rightIndex - 1];
  const [x2, y2] = controls[rightIndex];
  const ratio = (column - x1) / (x2 - x1);
  return Math.round(y1 + (y2 - y1) * ratio);
}

function biomeFor(column) {
  if (column < 20) return 'meadow';
  if (column < 44) return 'forest';
  if (column < 60) return 'river';
  if (column < 82) return 'waterfall';
  if (column < 104) return 'ruins';
  if (column < 124) return 'mist';
  return 'snow';
}

function surfaceGid(biome) {
  return tile[biome === 'waterfall' ? 'cliff' : biome];
}

function fillGid(biome) {
  if (biome === 'snow') return tile.snowStone;
  if (biome === 'waterfall' || biome === 'ruins') return tile.stone;
  return tile.soil;
}

function emptyLayer() {
  return Array.from({ length: MAP_WIDTH * MAP_HEIGHT }, () => 0);
}

function put(layer, column, row, gid) {
  if (column < 0 || column >= MAP_WIDTH || row < 0 || row >= MAP_HEIGHT) return;
  layer[row * MAP_WIDTH + column] = gid;
}

function hash(column, salt) {
  let value = Math.imul(column + 17, 0x45d9f3b) ^ Math.imul(salt + 31, 0x27d4eb2d);
  value ^= value >>> 16;
  return Math.abs(value);
}

const ground = emptyLayer();
const background = emptyLayer();
const details = emptyLayer();
const foreground = emptyLayer();

for (let column = 0; column < MAP_WIDTH; column += 1) {
  const row = surfaceRow(column);
  const biome = biomeFor(column);
  put(ground, column, row, surfaceGid(biome));
  for (let fillRow = row + 1; fillRow < MAP_HEIGHT; fillRow += 1) {
    put(ground, column, fillRow, fillGid(biome));
  }

  const noise = hash(column, 3);
  if (biome === 'forest' || biome === 'mist') {
    if (column % 2 === 0) put(background, column, row - 1, noise % 3 === 0 ? tile.pineTall : tile.pine);
  } else if (biome === 'snow') {
    if (column % 3 !== 1) put(background, column, row - 1, noise % 4 === 0 ? tile.deadPine : tile.pine);
  } else if (column % 4 === 0) {
    put(background, column, row - 1, noise % 2 ? tile.pine : tile.bush);
  }

  let detail = tile.grass;
  if (biome === 'meadow') detail = noise % 3 === 0 ? tile.goldFlowers : noise % 3 === 1 ? tile.whiteFlowers : tile.bush;
  if (biome === 'forest') detail = noise % 4 === 0 ? tile.stump : noise % 2 === 0 ? tile.mushrooms : tile.ferns;
  if (biome === 'river') detail = noise % 2 === 0 ? tile.reeds : tile.rock;
  if (biome === 'waterfall') detail = noise % 3 === 0 ? tile.crystal : noise % 2 === 0 ? tile.rock : tile.ferns;
  if (biome === 'ruins') detail = noise % 3 === 0 ? tile.pillar : noise % 2 === 0 ? tile.rock : tile.grass;
  if (biome === 'mist') detail = noise % 3 === 0 ? tile.lantern : noise % 2 === 0 ? tile.mushrooms : tile.ferns;
  if (biome === 'snow') detail = noise % 3 === 0 ? tile.crystal : noise % 2 === 0 ? tile.rock : tile.grass;
  if (column % 3 !== 1) put(details, column, row - 1, detail);

  if (column % 4 === 1 || column % 7 === 0) {
    put(foreground, column, Math.max(0, row - 1), noise % 3 === 0 ? tile.rock : noise % 2 === 0 ? tile.bush : tile.grass);
  }
}

// Hero landmarks and a few deliberately composed clearings.
for (let column = 47; column <= 56; column += 1) {
  put(details, column, surfaceRow(column) - 1, 0);
  put(background, column, surfaceRow(column) - 1, 0);
}
put(details, 48, surfaceRow(48) - 1, tile.bridge);
put(background, 65, surfaceRow(65) - 1, tile.waterfall);
put(details, 91, surfaceRow(91) - 1, tile.arch);
put(details, 86, surfaceRow(86) - 1, tile.pillar);
put(details, 98, surfaceRow(98) - 1, tile.pillar);
put(details, 116, surfaceRow(116) - 1, tile.lantern);
put(details, 137, surfaceRow(137) - 1, tile.campfire);
put(details, 141, surfaceRow(141) - 1, tile.flag);

let nextLayerId = 1;
const makeTileLayer = (name, data, opacity = 1) => ({
  id: nextLayerId++,
  name,
  type: 'tilelayer',
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  opacity,
  visible: true,
  x: 0,
  y: 0,
  data,
});

const biomes = [
  ['meadow', 0, 19], ['forest', 20, 43], ['river', 44, 59], ['waterfall', 60, 81],
  ['ruins', 82, 103], ['mist', 104, 123], ['snow', 124, 143],
].map(([name, start, end], index) => ({
  id: index + 1,
  name,
  type: 'biome',
  class: 'biome',
  x: Number(start) * TILE,
  y: 0,
  width: (Number(end) - Number(start) + 1) * TILE,
  height: MAP_HEIGHT * TILE,
  rotation: 0,
  visible: true,
  properties: [
    { name: 'startColumn', type: 'int', value: Number(start) },
    { name: 'endColumn', type: 'int', value: Number(end) },
  ],
}));

const routePoints = Array.from({ length: MAP_WIDTH }, (_, column) => ({
  x: column * TILE,
  y: surfaceRow(column) * TILE,
}));

const map = {
  compressionlevel: -1,
  height: MAP_HEIGHT,
  infinite: false,
  layers: [
    makeTileLayer('Background vegetation', background, 0.76),
    makeTileLayer('Ground', ground),
    makeTileLayer('Path details', details),
    makeTileLayer('Foreground', foreground, 0.92),
    {
      id: nextLayerId++,
      name: 'Route',
      type: 'objectgroup',
      draworder: 'topdown',
      opacity: 1,
      visible: false,
      x: 0,
      y: 0,
      objects: [{
        id: 1000,
        name: 'Player route',
        type: 'route',
        class: 'route',
        x: 0,
        y: 0,
        rotation: 0,
        visible: true,
        polyline: routePoints,
      }],
    },
    {
      id: nextLayerId++,
      name: 'Biomes',
      type: 'objectgroup',
      draworder: 'topdown',
      opacity: 1,
      visible: false,
      x: 0,
      y: 0,
      objects: biomes,
    },
  ],
  nextlayerid: nextLayerId,
  nextobjectid: 1001,
  orientation: 'orthogonal',
  renderorder: 'right-down',
  tiledversion: '1.12.2',
  tileheight: TILE,
  tilesets: [{ firstgid: 1, source: 'gjeravica-tiles.tsj' }],
  tilewidth: TILE,
  type: 'map',
  version: '1.10',
  width: MAP_WIDTH,
};

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${JSON.stringify(map, null, 2)}\n`, 'utf8');
console.log(`Generated ${OUTPUT} (${MAP_WIDTH}x${MAP_HEIGHT}, ${MAP_WIDTH * TILE}px wide)`);
