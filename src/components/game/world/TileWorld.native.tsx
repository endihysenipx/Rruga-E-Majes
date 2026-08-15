import {
  Canvas,
  Circle,
  Group,
  Line,
  LinearGradient,
  Path,
  Rect,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/tokens';

import {
  DISCOVERY_TILES,
  TILE_WIDTH,
  WORLD_MAP,
  WORLD_SCENE_HEIGHT,
  WORLD_TILES,
  WORLD_WIDTH,
} from './worldData';

const CHUNK_COLUMNS = 12;
const CHUNK_WIDTH = CHUNK_COLUMNS * TILE_WIDTH;
const CHUNK_OVERLAP = 190;
const CHUNKS = Array.from({ length: Math.ceil(WORLD_MAP.width / CHUNK_COLUMNS) }, (_, index) => index);

const GID = {
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
} as const;

interface MapCell {
  gid: number;
  column: number;
  row: number;
}

interface TileWorldProps {
  cameraOffset: Animated.Value;
  activeBiomeIndex: number;
  isWalking: boolean;
}

const SKY_PALETTES = [
  ['#8ab3aa', '#4c7770', '#173d36'],
  ['#70968d', '#375e55', '#12342d'],
  ['#76a3a7', '#3a7278', '#143d45'],
  ['#67949b', '#336872', '#133a42'],
  ['#8d967f', '#596650', '#27392f'],
  ['#819b94', '#516f69', '#263f3b'],
  ['#7894ad', '#49657e', '#263a50'],
] as const;

function cellsForLayer(name: string): MapCell[] {
  const data = WORLD_MAP.layers.find((layer) => layer.name === name)?.data ?? [];
  return data.flatMap((gid, index) => gid === 0 ? [] : [{
    gid,
    column: index % WORLD_MAP.width,
    row: Math.floor(index / WORLD_MAP.width),
  }]);
}

const BACKGROUND_CELLS = cellsForLayer('Background vegetation');
const GROUND_CELLS = cellsForLayer('Ground');
const DETAIL_CELLS = cellsForLayer('Path details');
const FOREGROUND_CELLS = cellsForLayer('Foreground');

function tileShade(gid: number, column: number, row: number): string {
  const variation = (column * 7 + row * 11) % 4;
  if (gid === GID.snowStone) return ['#4d6261', '#455b5a', '#526866', '#405554'][variation]!;
  if (gid === GID.stone) return ['#46564f', '#3e5049', '#4b5b54', '#394a44'][variation]!;
  if (gid === GID.soil) return ['#294438', '#243d32', '#304a3d', '#20372d'][variation]!;
  return ['#365545', '#2f4e3f', '#3a5b48', '#294638'][variation]!;
}

function TerrainCell({ cell, offsetX }: { cell: MapCell; offsetX: number }) {
  const x = cell.column * TILE_WIDTH - offsetX;
  const y = cell.row * TILE_WIDTH;
  const isTop = cell.gid <= GID.snow;
  const topColor = cell.gid === GID.snow ? '#e4efeb'
    : cell.gid === GID.ruins ? '#a6a273'
      : cell.gid === GID.mist ? '#87ab9b'
        : cell.gid === GID.river ? '#7fc0a5'
          : cell.gid === GID.cliff ? '#75a281'
            : cell.gid === GID.forest ? '#5d9b6d'
              : '#8ec476';

  return (
    <Group>
      <Rect x={x} y={y} width={TILE_WIDTH + 0.7} height={TILE_WIDTH + 0.7} color={tileShade(cell.gid, cell.column, cell.row)} />
      <Path
        path={`M ${x + 5} ${y + 13} L ${x + 18} ${y + 20} L ${x + 14} ${y + 34} M ${x + 32} ${y + 27} L ${x + 41} ${y + 34}`}
        color='rgba(155,181,166,0.14)'
        style='stroke'
        strokeWidth={1.3}
      />
      <Line p1={vec(x + TILE_WIDTH, y + 7)} p2={vec(x + TILE_WIDTH, y + TILE_WIDTH - 4)} color='rgba(5,18,14,0.12)' strokeWidth={1} />
      {isTop ? (
        <Group>
          <Rect x={x} y={y} width={TILE_WIDTH + 1} height={8} color={topColor} />
          <Path
            path={`M ${x} ${y + 8} Q ${x + 7} ${y + 3} ${x + 13} ${y + 8} T ${x + 26} ${y + 7} T ${x + 40} ${y + 8} T ${x + 49} ${y + 5}`}
            color={topColor}
            style='stroke'
            strokeWidth={4}
          />
          {cell.gid === GID.snow ? <Rect x={x} y={y} width={TILE_WIDTH + 1} height={13} color='rgba(235,246,244,0.82)' /> : null}
          {cell.column % 3 === 0 && cell.gid !== GID.snow ? (
            <Path path={`M ${x + 9} ${y + 4} L ${x + 13} ${y - 5} M ${x + 14} ${y + 5} L ${x + 19} ${y - 3}`} color={topColor} style='stroke' strokeWidth={2} />
          ) : null}
        </Group>
      ) : null}
    </Group>
  );
}

function Pine({ x, y, tall = false, dead = false }: { x: number; y: number; tall?: boolean; dead?: boolean }) {
  const height = tall ? 158 : 116;
  const half = tall ? 43 : 34;
  const dark = dead ? '#4f5e54' : '#174a3b';
  const mid = dead ? '#68756b' : '#246047';
  const light = dead ? '#79857b' : '#42815b';
  return (
    <Group transform={[{ translateX: x }, { translateY: y }]}>
      <Rect x={-4} y={-height * 0.42} width={8} height={height * 0.43} color='#5d4130' />
      <Path path={`M 0 ${-height} L ${-half * 0.72} ${-height * 0.53} L ${half * 0.72} ${-height * 0.53} Z`} color={light} />
      <Path path={`M 0 ${-height * 0.82} L ${-half} ${-height * 0.31} L ${half} ${-height * 0.31} Z`} color={mid} />
      <Path path={`M 0 ${-height * 0.62} L ${-half * 1.08} ${-height * 0.07} L ${half * 1.08} ${-height * 0.07} Z`} color={dark} />
      {!dead ? <Path path={`M -4 ${-height * 0.9} L ${-half * 0.42} ${-height * 0.56} M -5 ${-height * 0.71} L ${-half * 0.6} ${-height * 0.34}`} color='rgba(145,194,147,0.42)' style='stroke' strokeWidth={3} /> : null}
    </Group>
  );
}

function Bush({ x, y, foreground = false }: { x: number; y: number; foreground?: boolean }) {
  return (
    <Group transform={[{ translateX: x }, { translateY: y }]} opacity={foreground ? 0.92 : 1}>
      <Circle cx={-17} cy={-14} r={15} color={foreground ? '#1d503c' : '#397553'} />
      <Circle cx={2} cy={-21} r={19} color={foreground ? '#276045' : '#4b8d61'} />
      <Circle cx={22} cy={-13} r={14} color={foreground ? '#184735' : '#326b4d'} />
      <Circle cx={-2} cy={-25} r={5} color='rgba(139,190,137,0.38)' />
    </Group>
  );
}

function Flowers({ x, y, pale = false }: { x: number; y: number; pale?: boolean }) {
  const bloom = pale ? '#eef4ed' : '#f0bd4f';
  return (
    <Group transform={[{ translateX: x }, { translateY: y }]}>
      {[-13, 0, 14].map((dx, index) => (
        <Group key={`flower-${dx}`}>
          <Line p1={vec(dx, -1)} p2={vec(dx + (index - 1) * 2, -20 - index * 3)} color='#5b8f63' strokeWidth={2} />
          <Circle cx={dx + (index - 1) * 2} cy={-21 - index * 3} r={4.2} color={bloom} />
          <Circle cx={dx + (index - 1) * 2} cy={-21 - index * 3} r={1.5} color={pale ? '#c7d8d0' : '#fff0a4'} />
        </Group>
      ))}
    </Group>
  );
}

function Rock({ x, y, foreground = false }: { x: number; y: number; foreground?: boolean }) {
  const scale = foreground ? 1.2 : 1;
  return (
    <Group transform={[{ translateX: x }, { translateY: y }, { scale: scale }]}>
      <Path path='M -26 0 L -21 -19 L -7 -33 L 13 -28 L 27 -12 L 24 0 Z' color={foreground ? '#435650' : '#667872'} />
      <Path path='M -18 -18 L -7 -28 L 10 -24 L 18 -13 L -1 -17 Z' color='rgba(175,193,184,0.32)' />
      <Line p1={vec(-7, -4)} p2={vec(13, -9)} color='rgba(20,42,35,0.35)' strokeWidth={2} />
    </Group>
  );
}

function Grass({ x, y, foreground = false }: { x: number; y: number; foreground?: boolean }) {
  return (
    <Group transform={[{ translateX: x }, { translateY: y }]} opacity={foreground ? 0.9 : 1}>
      {[-19, -11, -3, 5, 13, 20].map((dx, index) => (
        <Path
          key={`grass-${dx}`}
          path={`M ${dx} 2 Q ${dx + (index % 2 ? 9 : -7)} ${-18 - (index % 3) * 5} ${dx + (index % 2 ? 5 : -4)} ${-33 - (index % 2) * 8}`}
          color={foreground ? '#2d6c4c' : '#69a267'}
          style='stroke'
          strokeWidth={3}
        />
      ))}
    </Group>
  );
}

function DetailCell({ cell, offsetX, foreground = false }: { cell: MapCell; offsetX: number; foreground?: boolean }) {
  const x = cell.column * TILE_WIDTH - offsetX + TILE_WIDTH / 2;
  const y = (cell.row + 1) * TILE_WIDTH;

  if (cell.gid === GID.pineTall) return <Pine x={x} y={y} tall />;
  if (cell.gid === GID.pine) return <Pine x={x} y={y} />;
  if (cell.gid === GID.deadPine) return <Pine x={x} y={y} tall dead />;
  if (cell.gid === GID.bush) return <Bush x={x} y={y} foreground={foreground} />;
  if (cell.gid === GID.goldFlowers) return <Flowers x={x} y={y} />;
  if (cell.gid === GID.whiteFlowers) return <Flowers x={x} y={y} pale />;
  if (cell.gid === GID.rock) return <Rock x={x} y={y} foreground={foreground} />;
  if (cell.gid === GID.grass || cell.gid === GID.ferns || cell.gid === GID.reeds) return <Grass x={x} y={y} foreground={foreground} />;

  if (cell.gid === GID.stump) {
    return <Group transform={[{ translateX: x }, { translateY: y }]}><RoundedRect x={-18} y={-31} width={36} height={31} r={7} color='#73503a' /><RoundedRect x={-20} y={-35} width={40} height={11} r={6} color='#9a744f' /><Circle cx={0} cy={-30} r={9} color='#745036' /></Group>;
  }
  if (cell.gid === GID.lantern) {
    return <Group transform={[{ translateX: x }, { translateY: y }]}><Line p1={vec(0, 0)} p2={vec(0, -62)} color='#544c39' strokeWidth={5} /><Circle cx={0} cy={-48} r={23} color='rgba(245,201,98,0.12)' /><RoundedRect x={-10} y={-59} width={20} height={24} r={6} color='#e9bd59' /><Rect x={-6} y={-55} width={12} height={16} color='#fff0a0' /></Group>;
  }
  if (cell.gid === GID.mushrooms) {
    return <Group transform={[{ translateX: x }, { translateY: y }]}><Rect x={-15} y={-16} width={5} height={16} color='#e7dbc1' /><Path path='M -23 -15 Q -12 -34 -2 -15 Z' color='#d06e58' /><Rect x={9} y={-12} width={5} height={12} color='#eee2c8' /><Path path='M 2 -11 Q 12 -27 22 -11 Z' color='#e3ae55' /><Circle cx={-11} cy={-20} r={2} color='#fff0d3' /></Group>;
  }
  if (cell.gid === GID.crystal) {
    return <Group transform={[{ translateX: x }, { translateY: y }]}><Path path='M -24 0 L -17 -42 L -4 -19 L 7 -54 L 24 0 Z' color='#5bd2cf' /><Path path='M 7 -54 L 12 -6 L 0 -18 Z' color='#c9ffff' /><Circle cx={1} cy={-23} r={31} color='rgba(99,226,220,0.09)' /></Group>;
  }
  if (cell.gid === GID.pillar) {
    return <Group transform={[{ translateX: x }, { translateY: y }]}><Rect x={-16} y={-106} width={32} height={106} color='#777d6f' /><Rect x={-23} y={-111} width={46} height={13} color='#a19c76' /><Rect x={-21} y={-9} width={42} height={9} color='#565f54' /><Path path='M -9 -90 L 6 -72 L -3 -49 L 11 -31' color='#4d5b50' style='stroke' strokeWidth={3} /></Group>;
  }
  if (cell.gid === GID.arch) {
    return <Group transform={[{ translateX: x + 28 }, { translateY: y }]}><Path path='M -88 0 L -88 -120 Q 0 -202 88 -120 L 88 0 L 55 0 L 55 -110 Q 0 -159 -55 -110 L -55 0 Z' color='#747c70' /><Path path='M -87 -117 Q 0 -199 87 -117' color='#b1aa7d' style='stroke' strokeWidth={10} /><Path path='M -61 -59 L -80 -39 M 56 -82 L 77 -63' color='#4b5a50' style='stroke' strokeWidth={4} /></Group>;
  }
  if (cell.gid === GID.waterfall) {
    return <Group transform={[{ translateX: x }, { translateY: y }]}><Path path='M -72 0 L -66 -230 L -30 -267 L 24 -250 L 67 -209 L 76 0 Z' color='#344c47' /><Path path='M -27 -251 Q -3 -216 -17 -168 T -11 -76 T -2 0 L 38 0 Q 22 -54 34 -112 T 25 -248 Z' color='#6ec9cf' /><Path path='M -14 -249 Q 9 -202 -4 -154 T 7 -58 T 10 0' color='#c5f3f0' style='stroke' strokeWidth={9} /><Circle cx={1} cy={-4} r={49} color='rgba(168,236,232,0.18)' /><Circle cx={-32} cy={-1} r={22} color='rgba(212,250,247,0.16)' /></Group>;
  }
  if (cell.gid === GID.bridge) {
    return <Group transform={[{ translateX: x }, { translateY: y }]}><Path path='M -18 10 Q 187 -55 408 6 L 402 28 Q 184 -20 -14 31 Z' color='#704c32' /><Path path='M -10 3 Q 186 -57 410 0' color='#d3a158' style='stroke' strokeWidth={9} /><Path path='M -4 35 L -4 -32 M 402 31 L 402 -28' color='#4e3527' style='stroke' strokeWidth={8} />{[30, 86, 144, 203, 264, 326, 382].map((dx) => <Line key={`plank-${dx}`} p1={vec(dx, -8)} p2={vec(dx + 3, 21)} color='rgba(49,30,20,0.55)' strokeWidth={3} />)}</Group>;
  }
  if (cell.gid === GID.campfire) {
    return <Group transform={[{ translateX: x }, { translateY: y }]}><Circle cx={0} cy={-23} r={35} color='rgba(240,150,52,0.12)' /><Line p1={vec(-19, -2)} p2={vec(18, -20)} color='#6d4932' strokeWidth={8} /><Line p1={vec(-18, -20)} p2={vec(19, -2)} color='#6d4932' strokeWidth={8} /><Path path='M 0 -8 Q -27 -28 -8 -50 Q -10 -72 4 -87 Q 27 -59 17 -40 Q 33 -20 0 -8 Z' color='#ed7134' /><Path path='M 2 -13 Q -12 -28 1 -43 Q -1 -54 6 -62 Q 18 -44 11 -31 Q 20 -20 2 -13 Z' color='#ffd477' /></Group>;
  }
  if (cell.gid === GID.flag) {
    return <Group transform={[{ translateX: x }, { translateY: y }]}><Line p1={vec(0, 0)} p2={vec(0, -150)} color='#684a36' strokeWidth={7} /><Path path='M 3 -146 Q 57 -128 94 -147 L 82 -91 Q 48 -78 3 -96 Z' color='#d8ad4f' /><Path path='M 3 -140 Q 49 -124 87 -140' color='#f4d57b' style='stroke' strokeWidth={4} /></Group>;
  }
  return null;
}

function cellsInChunk(cells: MapCell[], chunkIndex: number): MapCell[] {
  const start = chunkIndex * CHUNK_COLUMNS;
  const end = Math.min(WORLD_MAP.width, start + CHUNK_COLUMNS);
  return cells.filter((cell) => cell.column >= start && cell.column < end);
}

function WorldChunk({ chunkIndex, layer }: { chunkIndex: number; layer: 'back' | 'main' | 'front' }) {
  const worldX = chunkIndex * CHUNK_WIDTH;
  const left = Math.max(0, worldX - CHUNK_OVERLAP);
  const right = Math.min(WORLD_WIDTH, worldX + CHUNK_WIDTH + CHUNK_OVERLAP);
  const width = right - left;
  const back = cellsInChunk(BACKGROUND_CELLS, chunkIndex);
  const ground = cellsInChunk(GROUND_CELLS, chunkIndex);
  const details = cellsInChunk(DETAIL_CELLS, chunkIndex);
  const foreground = cellsInChunk(FOREGROUND_CELLS, chunkIndex);
  const discoveries = DISCOVERY_TILES.filter((column) => column >= chunkIndex * CHUNK_COLUMNS && column < (chunkIndex + 1) * CHUNK_COLUMNS);

  return (
    <Canvas pointerEvents='none' style={[styles.chunk, { left, width }]}>
      {layer === 'back' ? back.map((cell) => <DetailCell key={`b-${cell.column}-${cell.row}`} cell={cell} offsetX={left} />) : null}
      {layer === 'main' ? ground.map((cell) => <TerrainCell key={`g-${cell.column}-${cell.row}`} cell={cell} offsetX={left} />) : null}
      {layer === 'main' ? details.map((cell) => <DetailCell key={`d-${cell.column}-${cell.row}`} cell={cell} offsetX={left} />) : null}
      {layer === 'main' ? discoveries.map((column) => {
        const x = column * TILE_WIDTH - left + TILE_WIDTH / 2;
        const y = WORLD_SCENE_HEIGHT - WORLD_TILES[column]!.walkHeight - 58;
        return <Group key={`discovery-${column}`}><Circle cx={x} cy={y} r={22} color='rgba(242,205,111,0.14)' /><Circle cx={x} cy={y} r={10} color='#f0ca68' /><Path path={`M ${x} ${y - 6} L ${x + 6} ${y} L ${x} ${y + 6} L ${x - 6} ${y} Z`} color='#fff0af' /></Group>;
      }) : null}
      {layer === 'front' ? foreground.map((cell) => <DetailCell key={`f-${cell.column}-${cell.row}`} cell={cell} offsetX={left} foreground />) : null}
    </Canvas>
  );
}

function Horizon({ depth }: { depth: 'far' | 'mid' }) {
  const width = depth === 'far' ? 2500 : 3600;
  const base = depth === 'far' ? 350 : 386;
  const color = depth === 'far' ? 'rgba(30,68,66,0.52)' : 'rgba(19,56,49,0.76)';
  const peaks = Array.from({ length: depth === 'far' ? 15 : 23 }, (_, index) => {
    const step = depth === 'far' ? 185 : 158;
    const x = index * step - 80;
    const height = (depth === 'far' ? 105 : 82) + (index % 4) * (depth === 'far' ? 26 : 18);
    return `${index === 0 ? `M ${x} ${base}` : `L ${x} ${base}`} L ${x + step * 0.52} ${base - height} L ${x + step} ${base}`;
  }).join(' ');
  return <Canvas style={{ width, height: WORLD_SCENE_HEIGHT }}><Path path={`${peaks} L ${width} ${WORLD_SCENE_HEIGHT} L 0 ${WORLD_SCENE_HEIGHT} Z`} color={color} />{depth === 'mid' ? Array.from({ length: 38 }, (_, index) => <Pine key={`horizon-pine-${index}`} x={index * 97 + 30} y={base + 18} tall={index % 3 === 0} />) : null}</Canvas>;
}

export function TileWorld({ cameraOffset, activeBiomeIndex, isWalking }: TileWorldProps) {
  const farTranslate = useMemo(() => Animated.multiply(cameraOffset, -0.08), [cameraOffset]);
  const midTranslate = useMemo(() => Animated.multiply(cameraOffset, -0.2), [cameraOffset]);
  const worldTranslate = useMemo(() => Animated.multiply(cameraOffset, -1), [cameraOffset]);
  const sky = SKY_PALETTES[activeBiomeIndex] ?? SKY_PALETTES[0];

  return (
    <View pointerEvents='none' style={StyleSheet.absoluteFill}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={1200} height={WORLD_SCENE_HEIGHT}><LinearGradient start={vec(0, 0)} end={vec(0, WORLD_SCENE_HEIGHT)} colors={[...sky]} /></Rect>
        <Circle cx={286} cy={123} r={58} color='rgba(244,216,146,0.08)' />
        <Circle cx={286} cy={123} r={31} color='rgba(248,225,161,0.48)' />
        <Circle cx={276} cy={114} r={22} color='rgba(255,240,190,0.36)' />
        {Array.from({ length: 7 }, (_, index) => <Group key={`cloud-${index}`} transform={[{ translateX: 42 + index * 164 }, { translateY: 80 + (index % 3) * 48 }]} opacity={0.1 + (index % 2) * 0.05}><Circle cx={0} cy={0} r={20} color='#d8e8e2' /><Circle cx={24} cy={-7} r={27} color='#d8e8e2' /><Circle cx={51} cy={1} r={19} color='#d8e8e2' /><RoundedRect x={-4} y={-1} width={62} height={22} r={12} color='#d8e8e2' /></Group>)}
        {activeBiomeIndex === 6 ? Array.from({ length: 34 }, (_, index) => <Circle key={`snow-${index}`} cx={(index * 73) % 390} cy={100 + ((index * 97) % 330)} r={index % 3 === 0 ? 2.5 : 1.6} color='rgba(237,247,245,0.72)' />) : null}
      </Canvas>

      <Animated.View style={[styles.horizon, { width: 2500, transform: [{ translateX: farTranslate }] }]}><Horizon depth='far' /></Animated.View>
      <Animated.View style={[styles.horizon, { width: 3600, transform: [{ translateX: midTranslate }] }]}><Horizon depth='mid' /></Animated.View>

      <Animated.View style={[styles.world, { transform: [{ translateX: worldTranslate }] }]}>
        {CHUNKS.map((chunkIndex) => <WorldChunk key={`back-${chunkIndex}`} chunkIndex={chunkIndex} layer='back' />)}
        {CHUNKS.map((chunkIndex) => <WorldChunk key={`main-${chunkIndex}`} chunkIndex={chunkIndex} layer='main' />)}
      </Animated.View>

      {activeBiomeIndex === 5 ? <View style={styles.mist}><View style={[styles.mistBand, styles.mistOne]} /><View style={[styles.mistBand, styles.mistTwo]} /></View> : null}
      {isWalking ? <View style={styles.motionVeil} /> : null}
    </View>
  );
}

export function TileWorldForeground({ cameraOffset }: Pick<TileWorldProps, 'cameraOffset'>) {
  const worldTranslate = useMemo(() => Animated.multiply(cameraOffset, -1), [cameraOffset]);
  return (
    <Animated.View pointerEvents='none' style={[styles.world, styles.foreground, { transform: [{ translateX: worldTranslate }] }]}>
      {CHUNKS.map((chunkIndex) => <WorldChunk key={`front-${chunkIndex}`} chunkIndex={chunkIndex} layer='front' />)}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  horizon: { position: 'absolute', left: -120, top: 0, height: WORLD_SCENE_HEIGHT },
  world: { position: 'absolute', left: 0, top: 0, width: WORLD_WIDTH, height: WORLD_SCENE_HEIGHT },
  chunk: { position: 'absolute', top: 0, height: WORLD_SCENE_HEIGHT },
  foreground: { zIndex: 8 },
  mist: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  mistBand: { position: 'absolute', width: 460, height: 74, borderRadius: 80, backgroundColor: 'rgba(221,235,229,0.11)' },
  mistOne: { left: -120, top: 235, transform: [{ rotate: '-7deg' }] },
  mistTwo: { right: -160, top: 330, transform: [{ rotate: '5deg' }] },
  motionVeil: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.black, opacity: 0.015 },
});
