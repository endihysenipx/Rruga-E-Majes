export const TILE_WIDTH = 96;

const SURFACE_HEIGHTS = [
  112, 116, 119, 117, 122, 126, 124, 128, 132, 130, 134, 138,
  140, 144, 148, 151, 148, 145, 142, 138, 134, 128, 92, 88,
  86, 90, 126, 132, 138, 145, 151, 158, 164, 160, 154, 150,
  148, 146, 144, 142, 144, 148, 152, 154, 156, 154, 152, 150,
  148, 144, 138, 132, 126, 120, 116, 118, 124, 132, 140, 148,
  150, 156, 162, 168, 174, 180, 186, 192, 198, 204, 210, 216,
  218, 220, 222, 220, 218, 220, 222, 224, 226, 228, 230, 232,
] as const;

export type BiomeId = 'meadow' | 'forest' | 'river' | 'waterfall' | 'ruins' | 'mist' | 'snow';
export type WorldSpriteKind = 'pines' | 'rocks' | 'bridge' | 'waterfall' | 'ruins' | 'summitFire';
export type PropLayer = 'back' | 'front';

export interface WorldBiome {
  id: BiomeId;
  nameKey: string;
  startTile: number;
  endTile: number;
  soil: readonly [string, string, string];
  edge: string;
  accent: string;
}

export interface TerrainTile {
  index: number;
  surfaceHeight: number;
  walkHeight: number;
  biome: WorldBiome;
  isWater: boolean;
}

export interface WorldProp {
  kind: WorldSpriteKind;
  tile: number;
  width: number;
  height: number;
  layer: PropLayer;
  opacity?: number;
  flip?: boolean;
  bottomOffset?: number;
}

export const WORLD_BIOMES: readonly WorldBiome[] = [
  { id: 'meadow', nameKey: 'walkingScene.biomes.meadow', startTile: 0, endTile: 11, soil: ['#29483A', '#183128', '#0A1B17'], edge: '#78A875', accent: '#E7B85A' },
  { id: 'forest', nameKey: 'walkingScene.biomes.forest', startTile: 12, endTile: 21, soil: ['#203C31', '#122A22', '#081915'], edge: '#4E8667', accent: '#C69A50' },
  { id: 'river', nameKey: 'walkingScene.biomes.river', startTile: 22, endTile: 27, soil: ['#32463F', '#1B302B', '#0A1A18'], edge: '#73A18B', accent: '#74C9D1' },
  { id: 'waterfall', nameKey: 'walkingScene.biomes.waterfall', startTile: 28, endTile: 39, soil: ['#263D36', '#152B26', '#091A17'], edge: '#65947D', accent: '#8BD6DC' },
  { id: 'ruins', nameKey: 'walkingScene.biomes.ruins', startTile: 40, endTile: 51, soil: ['#3A4135', '#242D25', '#111A16'], edge: '#8B8E68', accent: '#D7B260' },
  { id: 'mist', nameKey: 'walkingScene.biomes.mist', startTile: 52, endTile: 63, soil: ['#263B37', '#172B28', '#0A1917'], edge: '#78978D', accent: '#B2CBC4' },
  { id: 'snow', nameKey: 'walkingScene.biomes.snow', startTile: 64, endTile: 83, soil: ['#394746', '#202F30', '#0D191B'], edge: '#D7E6E4', accent: '#F1D28A' },
] as const;

function biomeForTile(tileIndex: number): WorldBiome {
  return WORLD_BIOMES.find((biome) => tileIndex >= biome.startTile && tileIndex <= biome.endTile) ?? WORLD_BIOMES[WORLD_BIOMES.length - 1]!;
}

function bridgeWalkHeight(tileIndex: number, surfaceHeight: number): number {
  if (tileIndex === 20) return 142;
  if (tileIndex === 21) return 150;
  if (tileIndex >= 22 && tileIndex <= 25) return 160;
  if (tileIndex === 26) return 148;
  return surfaceHeight;
}

export const WORLD_TILES: readonly TerrainTile[] = SURFACE_HEIGHTS.map((surfaceHeight, index) => ({
  index,
  surfaceHeight,
  walkHeight: bridgeWalkHeight(index, surfaceHeight),
  biome: biomeForTile(index),
  isWater: index >= 22 && index <= 25,
}));

export const WORLD_WIDTH = WORLD_TILES.length * TILE_WIDTH;
export const WORLD_ROUTE_START = TILE_WIDTH * 0.55;
export const WORLD_ROUTE_END = WORLD_WIDTH - TILE_WIDTH * 0.7;

export const WORLD_PROPS: readonly WorldProp[] = [
  { kind: 'pines', tile: 1.3, width: 188, height: 200, layer: 'back', opacity: 0.84 },
  { kind: 'rocks', tile: 5.2, width: 150, height: 100, layer: 'front' },
  { kind: 'pines', tile: 7.1, width: 238, height: 254, layer: 'back', flip: true },
  { kind: 'rocks', tile: 10.2, width: 130, height: 86, layer: 'front', flip: true },
  { kind: 'pines', tile: 12.3, width: 260, height: 278, layer: 'back' },
  { kind: 'pines', tile: 15.6, width: 205, height: 219, layer: 'back', flip: true, opacity: 0.9 },
  { kind: 'rocks', tile: 18.1, width: 155, height: 103, layer: 'front' },
  { kind: 'bridge', tile: 20.1, width: 570, height: 214, layer: 'back', bottomOffset: -70 },
  { kind: 'pines', tile: 27.2, width: 230, height: 245, layer: 'back', opacity: 0.82 },
  { kind: 'rocks', tile: 29.1, width: 145, height: 96, layer: 'front', flip: true },
  { kind: 'waterfall', tile: 31.4, width: 235, height: 352, layer: 'back', bottomOffset: -20 },
  { kind: 'pines', tile: 35.1, width: 190, height: 203, layer: 'back', flip: true, opacity: 0.82 },
  { kind: 'rocks', tile: 38.2, width: 176, height: 117, layer: 'front' },
  { kind: 'pines', tile: 40.5, width: 225, height: 240, layer: 'back', opacity: 0.78 },
  { kind: 'ruins', tile: 44.3, width: 315, height: 210, layer: 'back', bottomOffset: -14 },
  { kind: 'rocks', tile: 48.4, width: 150, height: 100, layer: 'front', flip: true },
  { kind: 'pines', tile: 51.1, width: 245, height: 261, layer: 'back', flip: true, opacity: 0.78 },
  { kind: 'pines', tile: 55.2, width: 185, height: 197, layer: 'back', opacity: 0.7 },
  { kind: 'rocks', tile: 58.3, width: 165, height: 110, layer: 'front' },
  { kind: 'pines', tile: 61.2, width: 220, height: 235, layer: 'back', flip: true, opacity: 0.7 },
  { kind: 'rocks', tile: 65.1, width: 140, height: 93, layer: 'front', flip: true },
  { kind: 'pines', tile: 67.3, width: 190, height: 203, layer: 'back', opacity: 0.62 },
  { kind: 'rocks', tile: 71.4, width: 170, height: 113, layer: 'front' },
  { kind: 'rocks', tile: 75.5, width: 136, height: 90, layer: 'front', flip: true },
  { kind: 'summitFire', tile: 79.1, width: 300, height: 200, layer: 'back', bottomOffset: -20 },
];

export const DISCOVERY_TILES = [8.6, 18.7, 29.6, 40.4, 53.8, 66.6, 78.2] as const;

export function getRouteHeight(worldPosition: number): number {
  const rawIndex = Math.max(0, Math.min(WORLD_TILES.length - 1, worldPosition / TILE_WIDTH));
  const leftIndex = Math.floor(rawIndex);
  const rightIndex = Math.min(WORLD_TILES.length - 1, leftIndex + 1);
  const blend = rawIndex - leftIndex;
  const leftHeight = WORLD_TILES[leftIndex]!.walkHeight;
  const rightHeight = WORLD_TILES[rightIndex]!.walkHeight;
  return leftHeight + (rightHeight - leftHeight) * blend;
}

export function getBiomeIndex(worldPosition: number): number {
  const tileIndex = Math.max(0, Math.min(WORLD_TILES.length - 1, Math.floor(worldPosition / TILE_WIDTH)));
  return Math.max(0, WORLD_BIOMES.findIndex((biome) => tileIndex >= biome.startTile && tileIndex <= biome.endTile));
}
