import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

import { visualAssets } from '@/config/assets';
import { colors, radius } from '@/theme/tokens';

import {
  DISCOVERY_TILES,
  getRouteHeight,
  TILE_WIDTH,
  WORLD_PROPS,
  WORLD_TILES,
  WORLD_WIDTH,
  type WorldProp,
} from './worldData';

const SKY_PALETTES = [
  ['#6E918D', '#365C58', '#112E2B'],
  ['#587D78', '#2D514D', '#102724'],
  ['#547E82', '#28525A', '#102B31'],
  ['#4D7378', '#284F55', '#10282D'],
  ['#61736C', '#3B504A', '#182A26'],
  ['#536B69', '#344E4C', '#142826'],
  ['#4D6680', '#30465C', '#152431'],
] as const;

const FAR_PEAKS = Array.from({ length: 23 }, (_, index) => ({
  left: index * 354 - 120,
  size: 230 + (index % 4) * 44,
  bottom: 142 + (index % 3) * 18,
  opacity: 0.34 + (index % 2) * 0.08,
}));

const MID_PEAKS = Array.from({ length: 28 }, (_, index) => ({
  left: index * 288 - 90,
  size: 190 + (index % 5) * 28,
  bottom: 116 + (index % 4) * 13,
  opacity: 0.42 + (index % 3) * 0.06,
}));

const BACKGROUND_PINES = [
  2, 6, 11, 16, 22, 28, 34, 41, 47, 53, 59, 65, 71, 77,
] as const;

interface TileWorldProps {
  cameraOffset: Animated.Value;
  activeBiomeIndex: number;
  isWalking: boolean;
}

function WorldSprite({ prop }: { prop: WorldProp }) {
  const tileIndex = Math.max(0, Math.min(WORLD_TILES.length - 1, Math.floor(prop.tile)));
  const surfaceHeight = WORLD_TILES[tileIndex]!.surfaceHeight;

  return (
    <Image
      accessibilityIgnoresInvertColors
      source={visualAssets.worldSprites[prop.kind]}
      resizeMode='contain'
      style={[
        styles.worldSprite,
        {
          left: prop.tile * TILE_WIDTH,
          bottom: surfaceHeight + (prop.bottomOffset ?? -8),
          width: prop.width,
          height: prop.height,
          opacity: prop.opacity ?? 1,
          transform: [{ scaleX: prop.flip ? -1 : 1 }],
        },
      ]}
    />
  );
}

export function TileWorld({ cameraOffset, activeBiomeIndex, isWalking }: TileWorldProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const farTranslate = useMemo(() => Animated.multiply(cameraOffset, -0.18), [cameraOffset]);
  const midTranslate = useMemo(() => Animated.multiply(cameraOffset, -0.34), [cameraOffset]);
  const treeTranslate = useMemo(() => Animated.multiply(cameraOffset, -0.58), [cameraOffset]);
  const worldTranslate = useMemo(() => Animated.multiply(cameraOffset, -1), [cameraOffset]);
  const sky = SKY_PALETTES[activeBiomeIndex] ?? SKY_PALETTES[0];

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: isWalking ? 850 : 1_450, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: isWalking ? 850 : 1_450, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [isWalking, pulse]);

  return (
    <View pointerEvents='none' style={StyleSheet.absoluteFill}>
      <LinearGradient colors={sky} locations={[0, 0.56, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.sunGlow}><View style={styles.sunCore} /></View>

      <Animated.View style={[styles.parallaxLayer, { width: WORLD_WIDTH, transform: [{ translateX: farTranslate }] }]}>
        {FAR_PEAKS.map((peak, index) => (
          <View
            key={`far-${index}`}
            style={[
              styles.mountain,
              {
                left: peak.left,
                bottom: peak.bottom,
                borderLeftWidth: peak.size / 2,
                borderRightWidth: peak.size / 2,
                borderBottomWidth: peak.size,
                borderBottomColor: `rgba(24,51,52,${peak.opacity})`,
              },
            ]}
          />
        ))}
      </Animated.View>

      <Animated.View style={[styles.parallaxLayer, { width: WORLD_WIDTH, transform: [{ translateX: midTranslate }] }]}>
        {MID_PEAKS.map((peak, index) => (
          <View
            key={`mid-${index}`}
            style={[
              styles.mountain,
              {
                left: peak.left,
                bottom: peak.bottom,
                borderLeftWidth: peak.size / 2,
                borderRightWidth: peak.size / 2,
                borderBottomWidth: peak.size,
                borderBottomColor: `rgba(17,42,40,${peak.opacity})`,
              },
            ]}
          />
        ))}
        {Array.from({ length: 18 }, (_, index) => (
          <View key={`cloud-${index}`} style={[styles.cloud, { left: index * 420 + (index % 2) * 120, top: 128 + (index % 4) * 30 }]} />
        ))}
      </Animated.View>

      <Animated.View style={[styles.parallaxLayer, { width: WORLD_WIDTH, transform: [{ translateX: treeTranslate }] }]}>
        {BACKGROUND_PINES.map((tile, index) => (
          <Image
            key={`back-pines-${tile}`}
            accessibilityIgnoresInvertColors
            source={visualAssets.worldSprites.pines}
            resizeMode='contain'
            style={[
              styles.backgroundPines,
              {
                left: tile * TILE_WIDTH,
                width: 176 + (index % 3) * 26,
                height: 188 + (index % 3) * 28,
                opacity: 0.2 + (index % 2) * 0.08,
                transform: [{ scaleX: index % 2 === 0 ? 1 : -1 }],
              },
            ]}
          />
        ))}
      </Animated.View>

      <Animated.View style={[styles.worldLayer, { width: WORLD_WIDTH, transform: [{ translateX: worldTranslate }] }]}>
        <LinearGradient colors={['#3B7E83', '#164953', '#08262C']} style={styles.river}>
          <Animated.View
            style={[
              styles.waterShimmer,
              { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.26, 0.72] }) },
            ]}
          />
        </LinearGradient>

        {WORLD_PROPS.filter((prop) => prop.layer === 'back').map((prop, index) => <WorldSprite key={`back-prop-${index}`} prop={prop} />)}

        {WORLD_TILES.map((tile) => (
          <View
            key={`terrain-${tile.index}`}
            style={[
              styles.terrainTile,
              {
                left: tile.index * TILE_WIDTH,
                width: TILE_WIDTH + 3,
                height: tile.surfaceHeight,
              },
            ]}
          >
            <LinearGradient colors={tile.biome.soil} style={StyleSheet.absoluteFill} />
            <View style={[styles.terrainEdge, { backgroundColor: tile.biome.edge }]} />
            {tile.biome.id === 'snow' ? <View style={styles.snowCap} /> : null}
            {tile.index % 3 === 0 ? <View style={[styles.grassTuft, { borderBottomColor: tile.biome.accent }]} /> : null}
            {tile.index % 5 === 1 ? <View style={styles.pebble} /> : null}
            {tile.index % 7 === 2 ? <View style={[styles.rootLine, { transform: [{ rotate: tile.index % 2 ? '8deg' : '-7deg' }] }]} /> : null}
          </View>
        ))}

        {DISCOVERY_TILES.map((tile, index) => {
          const x = tile * TILE_WIDTH;
          return (
            <Animated.View
              key={`discovery-${tile}`}
              style={[
                styles.discovery,
                {
                  left: x,
                  bottom: getRouteHeight(x) + 54,
                  opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.58, 1] }),
                  transform: [{ translateY: pulse.interpolate({ inputRange: [0, 1], outputRange: [4, -5] }) }],
                },
              ]}
            >
              <View style={styles.discoveryGlow} />
              <View style={styles.discoveryCore}><Feather name={index === DISCOVERY_TILES.length - 1 ? 'flag' : 'star'} color={colors.black} size={13} /></View>
            </Animated.View>
          );
        })}
      </Animated.View>

      {activeBiomeIndex === 5 ? (
        <View style={styles.mistOverlay}>
          <View style={[styles.mistBand, styles.mistBandOne]} />
          <View style={[styles.mistBand, styles.mistBandTwo]} />
        </View>
      ) : null}

      {activeBiomeIndex === 6 ? (
        <View style={styles.snowfall}>
          {Array.from({ length: 20 }, (_, index) => (
            <Animated.View
              key={`snow-${index}`}
              style={[
                styles.snowflake,
                {
                  left: `${(index * 17) % 100}%`,
                  top: 92 + ((index * 47) % 310),
                  opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3 + (index % 3) * 0.12, 0.82] }),
                },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function TileWorldForeground({ cameraOffset }: Pick<TileWorldProps, 'cameraOffset'>) {
  const foregroundTranslate = useMemo(() => Animated.multiply(cameraOffset, -1.035), [cameraOffset]);

  return (
    <Animated.View
      pointerEvents='none'
      style={[styles.foregroundLayer, { width: WORLD_WIDTH, transform: [{ translateX: foregroundTranslate }] }]}
    >
      {WORLD_PROPS.filter((prop) => prop.layer === 'front').map((prop, index) => <WorldSprite key={`front-prop-${index}`} prop={prop} />)}
      {WORLD_TILES.filter((tile) => tile.index % 4 === 1).map((tile) => (
        <View
          key={`foreground-grass-${tile.index}`}
          style={[
            styles.foregroundGrass,
            {
              left: tile.index * TILE_WIDTH + TILE_WIDTH * 0.72,
              bottom: tile.surfaceHeight - 3,
              borderBottomColor: tile.biome.edge,
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sunGlow: { position: 'absolute', top: 104, right: 54, width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(241,210,138,0.12)', alignItems: 'center', justifyContent: 'center' },
  sunCore: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(241,210,138,0.72)', shadowColor: colors.goldSoft, shadowOpacity: 0.7, shadowRadius: 24 },
  parallaxLayer: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  worldLayer: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  foregroundLayer: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  mountain: { position: 'absolute', width: 0, height: 0, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  cloud: { position: 'absolute', width: 178, height: 38, borderRadius: 80, backgroundColor: 'rgba(218,231,226,0.08)', transform: [{ rotate: '-6deg' }] },
  backgroundPines: { position: 'absolute', bottom: 116 },
  river: { position: 'absolute', left: 21.3 * TILE_WIDTH, bottom: 68, width: 5.5 * TILE_WIDTH, height: 104, overflow: 'hidden', borderRadius: 46, borderWidth: 2, borderColor: 'rgba(137,216,221,0.28)' },
  waterShimmer: { position: 'absolute', left: 18, right: 18, top: 11, height: 4, borderRadius: radius.pill, backgroundColor: '#C6F1EC', shadowColor: '#A6E8EA', shadowOpacity: 0.8, shadowRadius: 12 },
  worldSprite: { position: 'absolute' },
  terrainTile: { position: 'absolute', bottom: 0, overflow: 'hidden', borderTopLeftRadius: 14, borderTopRightRadius: 14, marginLeft: -1 },
  terrainEdge: { position: 'absolute', left: -2, right: -2, top: 0, height: 10, borderRadius: 7, opacity: 0.9 },
  snowCap: { position: 'absolute', left: -2, right: -2, top: -1, height: 13, borderRadius: 8, backgroundColor: '#DCE8E5', opacity: 0.88 },
  grassTuft: { position: 'absolute', top: -7, left: 24, width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 18, borderLeftColor: 'transparent', borderRightColor: 'transparent', transform: [{ rotate: '-8deg' }] },
  pebble: { position: 'absolute', top: 22, right: 16, width: 18, height: 9, borderRadius: 8, backgroundColor: 'rgba(158,173,164,0.25)', transform: [{ rotate: '-7deg' }] },
  rootLine: { position: 'absolute', top: 50, left: 8, width: 64, height: 3, borderRadius: 2, backgroundColor: 'rgba(6,17,14,0.3)' },
  discovery: { position: 'absolute', width: 38, height: 38, marginLeft: -19, alignItems: 'center', justifyContent: 'center' },
  discoveryGlow: { position: 'absolute', width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(241,210,138,0.19)', borderWidth: 1, borderColor: 'rgba(241,210,138,0.46)' },
  discoveryCore: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center', shadowColor: colors.goldSoft, shadowOpacity: 0.8, shadowRadius: 13 },
  foregroundGrass: { position: 'absolute', width: 0, height: 0, borderLeftWidth: 11, borderRightWidth: 11, borderBottomWidth: 30, borderLeftColor: 'transparent', borderRightColor: 'transparent', opacity: 0.6, transform: [{ rotate: '9deg' }] },
  mistOverlay: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  mistBand: { position: 'absolute', width: 330, height: 82, borderRadius: 120, backgroundColor: 'rgba(213,228,223,0.1)' },
  mistBandOne: { top: 188, left: -84, transform: [{ rotate: '-8deg' }] },
  mistBandTwo: { top: 292, right: -130, transform: [{ rotate: '7deg' }] },
  snowfall: { ...StyleSheet.absoluteFillObject },
  snowflake: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: '#EAF4F3' },
});
