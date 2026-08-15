import worldMapJson from './maps/gjeravica-world.json';

export const TILE_WIDTH = worldMapJson.tilewidth;
export const WORLD_SCENE_HEIGHT = 540;

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

export interface TiledLayer {
  id: number;
  name: string;
  type: string;
  opacity: number;
  data?: number[];
  objects?: {
    name: string;
    polyline?: { x: number; y: number }[];
  }[];
}

export const WORLD_MAP = worldMapJson as unknown as {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
};

export const WORLD_BIOMES: readonly WorldBiome[] = [
  { id: 'meadow', nameKey: 'walkingScene.biomes.meadow', startTile: 0, endTile: 19, soil: ['#365542', '#243c31', '#12241d'], edge: '#8fc375', accent: '#edc760' },
  { id: 'forest', nameKey: 'walkingScene.biomes.forest', startTile: 20, endTile: 43, soil: ['#294838', '#1b3328', '#0d2019'], edge: '#5f9d70', accent: '#d7ac52' },
  { id: 'river', nameKey: 'walkingScene.biomes.river', startTile: 44, endTile: 59, soil: ['#3b544a', '#253c35', '#10251f'], edge: '#80b69a', accent: '#85d9dc' },
  { id: 'waterfall', nameKey: 'walkingScene.biomes.waterfall', startTile: 60, endTile: 81, soil: ['#4c5c55', '#33433d', '#182a25'], edge: '#82ac8e', accent: '#91e0df' },
  { id: 'ruins', nameKey: 'walkingScene.biomes.ruins', startTile: 82, endTile: 103, soil: ['#505346', '#35392f', '#1b211c'], edge: '#a6a273', accent: '#e0b85a' },
  { id: 'mist', nameKey: 'walkingScene.biomes.mist', startTile: 104, endTile: 123, soil: ['#3c514a', '#283b36', '#132621'], edge: '#8fb0a1', accent: '#c2d9d0' },
  { id: 'snow', nameKey: 'walkingScene.biomes.snow', startTile: 124, endTile: 143, soil: ['#536462', '#354846', '#1a2b2a'], edge: '#e4efeb', accent: '#f2d47c' },
] as const;

function biomeForTile(tileIndex: number): WorldBiome {
  return WORLD_BIOMES.find((biome) => tileIndex >= biome.startTile && tileIndex <= biome.endTile)
    ?? WORLD_BIOMES[WORLD_BIOMES.length - 1]!;
}

const routeLayer = WORLD_MAP.layers.find((layer) => layer.name === 'Route');
const routePoints = routeLayer?.objects?.find((object) => object.name === 'Player route')?.polyline ?? [];

export const WORLD_TILES: readonly TerrainTile[] = Array.from({ length: WORLD_MAP.width }, (_, index) => {
  const point = routePoints[index];
  const surfaceHeight = WORLD_SCENE_HEIGHT - (point?.y ?? WORLD_SCENE_HEIGHT - 120);
  const biome = biomeForTile(index);
  return {
    index,
    surfaceHeight,
    walkHeight: surfaceHeight + 2,
    biome,
    isWater: index >= 47 && index <= 56,
  };
});

export const WORLD_WIDTH = WORLD_MAP.width * TILE_WIDTH;
export const WORLD_ROUTE_START = TILE_WIDTH * 0.65;
export const WORLD_ROUTE_END = WORLD_WIDTH - TILE_WIDTH * 0.8;

// The web fallback still uses the existing painterly props. Native uses all
// four dense Tiled layers through Skia in TileWorld.native.tsx.
export const WORLD_PROPS: readonly WorldProp[] = [
  { kind: 'pines', tile: 2, width: 155, height: 165, layer: 'back', opacity: 0.78 },
  { kind: 'rocks', tile: 11, width: 118, height: 78, layer: 'front' },
  { kind: 'pines', tile: 23, width: 190, height: 203, layer: 'back', flip: true },
  { kind: 'bridge', tile: 47.5, width: 470, height: 176, layer: 'back', bottomOffset: -58 },
  { kind: 'waterfall', tile: 65, width: 210, height: 315, layer: 'back', bottomOffset: -18 },
  { kind: 'ruins', tile: 90, width: 295, height: 197, layer: 'back', bottomOffset: -12 },
  { kind: 'pines', tile: 112, width: 190, height: 203, layer: 'back', opacity: 0.68 },
  { kind: 'summitFire', tile: 136.5, width: 280, height: 187, layer: 'back', bottomOffset: -18 },
];

export const DISCOVERY_TILES = [14, 35, 54, 75, 95, 116, 139] as const;

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
