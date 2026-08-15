import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TileWorld, TileWorldForeground } from '@/components/game/world/TileWorld';
import {
  getBiomeIndex,
  TILE_WIDTH,
  WORLD_BIOMES,
  WORLD_ROUTE_END,
  WORLD_ROUTE_START,
  WORLD_TILES,
  WORLD_WIDTH,
} from '@/components/game/world/worldData';
import { AppText } from '@/components/ui/AppText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { visualAssets } from '@/config/assets';
import { progressPercent } from '@/domain/gameLogic';
import type { Journey } from '@/domain/models';
import { colors, radius, shadows, spacing } from '@/theme/tokens';

const FRAME_COUNT = 4;
const ACTIVE_FRAMES = [0, 1, 2, 1];
const AVATAR_FRAME_WIDTH = 90;
const AVATAR_HEIGHT = 160;
const WALK_DURATION = 4_200;
const DEFAULT_VIEWPORT_WIDTH = 342;

interface WalkingStageProps {
  journey: Journey;
  currentSteps: number;
  avatarId: string;
  isWalking: boolean;
  lastStepDelta: number;
  onOpenJourney: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function WalkingStage({ journey, currentSteps, avatarId, isWalking, lastStepDelta, onOpenJourney }: WalkingStageProps) {
  const { t } = useTranslation();
  const [framePosition, setFramePosition] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(DEFAULT_VIEWPORT_WIDTH);
  const cameraOffset = useRef(new Animated.Value(0)).current;
  const avatarPosition = useRef(new Animated.Value(18)).current;
  const playerWorldPosition = useRef(new Animated.Value(WORLD_ROUTE_START)).current;
  const gait = useRef(new Animated.Value(0)).current;
  const journeyRatio = clamp(currentSteps / Math.max(1, journey.virtualSteps), 0, 1);
  const worldPosition = WORLD_ROUTE_START + (WORLD_ROUTE_END - WORLD_ROUTE_START) * journeyRatio;
  const activeBiomeIndex = getBiomeIndex(worldPosition);
  const activeBiome = WORLD_BIOMES[activeBiomeIndex] ?? WORLD_BIOMES[0]!;
  const percent = Math.round(progressPercent(currentSteps, journey.virtualSteps));
  const avatarSource = avatarId === 'bora' ? visualAssets.walkingAvatars.bora
    : avatarId === 'drini' ? visualAssets.walkingAvatars.drini
      : visualAssets.walkingAvatars.arin;
  const routeElevation = useMemo(() => playerWorldPosition.interpolate({
    inputRange: WORLD_TILES.map((tile) => tile.index * TILE_WIDTH),
    outputRange: WORLD_TILES.map((tile) => tile.walkHeight),
    extrapolate: 'clamp',
  }), [playerWorldPosition]);
  const avatarRise = useMemo(() => Animated.multiply(routeElevation, -1), [routeElevation]);

  useEffect(() => {
    const cameraMax = Math.max(0, WORLD_WIDTH - viewportWidth);
    const cameraTarget = clamp(worldPosition - viewportWidth * 0.38, 0, cameraMax);
    const avatarTarget = clamp(
      worldPosition - cameraTarget - AVATAR_FRAME_WIDTH / 2,
      14,
      viewportWidth - AVATAR_FRAME_WIDTH - 14,
    );
    if (!isWalking) {
      cameraOffset.setValue(cameraTarget);
      avatarPosition.setValue(avatarTarget);
      playerWorldPosition.setValue(worldPosition);
      return undefined;
    }

    const travel = Animated.parallel([
      Animated.timing(cameraOffset, {
        toValue: cameraTarget,
        duration: WALK_DURATION,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(avatarPosition, {
        toValue: avatarTarget,
        duration: WALK_DURATION,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(playerWorldPosition, {
        toValue: worldPosition,
        duration: WALK_DURATION,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    travel.start();
    return () => travel.stop();
  }, [avatarPosition, cameraOffset, isWalking, playerWorldPosition, viewportWidth, worldPosition]);

  useEffect(() => {
    if (!isWalking) {
      setFramePosition(0);
      gait.stopAnimation();
      Animated.spring(gait, { toValue: 0, damping: 14, stiffness: 120, useNativeDriver: true }).start();
      return undefined;
    }

    let cursor = 0;
    const frameTimer = setInterval(() => {
      cursor = (cursor + 1) % ACTIVE_FRAMES.length;
      setFramePosition(ACTIVE_FRAMES[cursor]!);
    }, 135);
    const gaitLoop = Animated.loop(Animated.sequence([
      Animated.timing(gait, { toValue: 1, duration: 135, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(gait, { toValue: 0, duration: 135, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]));
    gaitLoop.start();

    return () => {
      clearInterval(frameTimer);
      gaitLoop.stop();
    };
  }, [gait, isWalking]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0 && nextWidth !== viewportWidth) setViewportWidth(nextWidth);
  };

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={t('walkingScene.openJourney')}
      onLayout={handleLayout}
      onPress={onOpenJourney}
      style={styles.stage}
    >
      <TileWorld cameraOffset={cameraOffset} activeBiomeIndex={activeBiomeIndex} isWalking={isWalking} />

      <Animated.View
        pointerEvents='none'
        style={[
          styles.dust,
          {
            opacity: isWalking ? gait.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.34] }) : 0,
            transform: [
              { translateX: avatarPosition },
              { translateY: avatarRise },
              { scaleX: gait.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1.22] }) },
            ],
          },
        ]}
      />
      <Animated.View
        pointerEvents='none'
        style={[
          styles.avatarShadow,
          {
            opacity: gait.interpolate({ inputRange: [0, 1], outputRange: [0.38, 0.2] }),
            transform: [
              { translateX: avatarPosition },
              { translateY: avatarRise },
              { scaleX: gait.interpolate({ inputRange: [0, 1], outputRange: [1, 0.8] }) },
            ],
          },
        ]}
      />
      <Animated.View
        pointerEvents='none'
        style={[
          styles.avatarViewport,
          {
            transform: [
              { translateX: avatarPosition },
              { translateY: avatarRise },
              { translateY: gait.interpolate({ inputRange: [0, 1], outputRange: [0, -7] }) },
              { rotate: gait.interpolate({ inputRange: [0, 1], outputRange: ['-0.8deg', '0.9deg'] }) },
            ],
          },
        ]}
      >
        <Animated.Image
          accessibilityIgnoresInvertColors
          source={avatarSource}
          resizeMode='stretch'
          style={[styles.avatarStrip, { left: -framePosition * AVATAR_FRAME_WIDTH }]}
        />
      </Animated.View>

      <TileWorldForeground cameraOffset={cameraOffset} />

      <LinearGradient
        pointerEvents='none'
        colors={['rgba(3,10,8,0.24)', 'transparent', 'rgba(3,10,8,0.62)']}
        locations={[0, 0.52, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents='none' style={styles.topHud}>
        <View style={styles.biomeBadge}>
          <Feather name='compass' color={colors.goldSoft} size={14} />
          <View style={styles.biomeCopy}>
            <AppText variant='caption' color={colors.goldSoft} style={styles.microCopy}>
              {t('walkingScene.zone', { number: activeBiomeIndex + 1, total: WORLD_BIOMES.length })}
            </AppText>
            <AppText variant='label' numberOfLines={1}>{t(activeBiome.nameKey)}</AppText>
          </View>
        </View>
        <View style={styles.percentSeal}><AppText variant='label' color={colors.black}>{percent}%</AppText></View>
      </View>

      <View pointerEvents='none' style={styles.zoneRail}>
        <View style={styles.zoneRailLine} />
        {WORLD_BIOMES.map((biome, index) => (
          <View
            key={biome.id}
            style={[
              styles.zoneDot,
              index <= activeBiomeIndex && styles.zoneDotReached,
              index === activeBiomeIndex && styles.zoneDotCurrent,
            ]}
          />
        ))}
      </View>

      <View pointerEvents='none' style={styles.activityPill}>
        <View style={[styles.statusDot, isWalking && styles.statusDotWalking]} />
        <AppText variant='caption' color={isWalking ? colors.goldSoft : colors.ink}>
          {t(isWalking ? 'walkingScene.walking' : 'walkingScene.resting')}
        </AppText>
        {isWalking || lastStepDelta <= 0 ? null : <AppText variant='caption' color={colors.goldSoft}>+{lastStepDelta.toLocaleString()}</AppText>}
      </View>

      <View pointerEvents='none' style={styles.bottomHud}>
        <View style={styles.progressCopy}>
          <AppText variant='caption' color={colors.ink}>{currentSteps.toLocaleString()} / {journey.virtualSteps.toLocaleString()} {t('common.steps')}</AppText>
          <AppText variant='caption' color={colors.goldSoft} style={styles.microCopy}>
            {t('walkingScene.worldScale', { tiles: WORLD_TILES.length, biomes: WORLD_BIOMES.length })}
          </AppText>
        </View>
        <ProgressBar compact value={currentSteps} max={journey.virtualSteps} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stage: { height: 540, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: '#16332F', ...shadows.card },
  topHud: { position: 'absolute', top: spacing.md, left: spacing.md, right: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  biomeBadge: { maxWidth: '76%', flexDirection: 'row', gap: spacing.sm, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.md, backgroundColor: 'rgba(4,14,11,0.82)', borderWidth: 1, borderColor: colors.border },
  biomeCopy: { flexShrink: 1 },
  percentSeal: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.goldSoft, borderWidth: 3, borderColor: 'rgba(7,20,17,0.72)' },
  zoneRail: { position: 'absolute', top: 79, left: spacing.xl, right: spacing.xl, height: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  zoneRailLine: { position: 'absolute', left: 2, right: 2, height: 2, backgroundColor: 'rgba(214,225,218,0.22)' },
  zoneDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(214,225,218,0.42)', borderWidth: 1, borderColor: 'rgba(4,14,11,0.7)' },
  zoneDotReached: { backgroundColor: colors.gold },
  zoneDotCurrent: { width: 13, height: 13, borderRadius: 7, borderWidth: 3, borderColor: 'rgba(4,14,11,0.72)', backgroundColor: colors.goldSoft },
  dust: { position: 'absolute', left: 3, bottom: -5, width: AVATAR_FRAME_WIDTH - 6, height: 20, borderRadius: 50, backgroundColor: 'rgba(207,190,143,0.38)' },
  avatarShadow: { position: 'absolute', left: 0, bottom: -1, width: AVATAR_FRAME_WIDTH, height: 14, borderRadius: 50, backgroundColor: colors.black },
  avatarViewport: { position: 'absolute', left: 0, bottom: 0, width: AVATAR_FRAME_WIDTH, height: AVATAR_HEIGHT, overflow: 'hidden' },
  avatarStrip: { position: 'absolute', bottom: 0, width: AVATAR_FRAME_WIDTH * FRAME_COUNT, height: AVATAR_HEIGHT },
  activityPill: { position: 'absolute', right: spacing.md, bottom: 86, maxWidth: '76%', flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: 11, paddingVertical: 7, backgroundColor: 'rgba(4,14,11,0.84)', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.muted },
  statusDotWalking: { backgroundColor: colors.ember, shadowColor: colors.ember, shadowOpacity: 0.9, shadowRadius: 7 },
  bottomHud: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: 13, gap: spacing.sm, paddingHorizontal: 13, paddingVertical: 10, borderRadius: radius.md, backgroundColor: 'rgba(4,14,11,0.92)', borderWidth: 1, borderColor: colors.border },
  progressCopy: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  microCopy: { fontSize: 9, lineHeight: 12, letterSpacing: 0.7, textTransform: 'uppercase' },
});
