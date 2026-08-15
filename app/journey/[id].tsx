import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/States';
import { visualAssets } from '@/config/assets';
import { journeys } from '@/data/seed';
import { progressPercent } from '@/domain/gameLogic';
import { useGameStore } from '@/store/useGameStore';
import { colors, radius, spacing } from '@/theme/tokens';

export default function RouteDetailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const journey = journeys.find((item) => item.id === id);
  const progress = useGameStore((state) => state.progress);
  const chooseJourney = useGameStore((state) => state.chooseJourney);
  if (!journey) return <EmptyState />;
  const unlocked = progress.unlockedJourneyIds.includes(journey.id);
  const selected = progress.currentJourneyId === journey.id;
  const completed = progress.completedJourneyIds.includes(journey.id);
  const current = progress.journeySteps[journey.id] ?? 0;
  const percent = Math.round(progressPercent(current, journey.virtualSteps));

  const select = () => { chooseJourney(journey.id); router.replace('/(tabs)'); };

  return (
    <Screen>
      <View style={styles.nav}><Pressable accessibilityRole='button' onPress={() => router.back()} style={styles.back}><Feather name='arrow-left' color={colors.ink} size={22} /></Pressable><AppText variant='label'>{t('route.virtualJourney')}</AppText><View style={styles.spacer} /></View>
      <ImageBackground source={visualAssets.journeyArtwork[journey.regionId]} resizeMode='cover' style={styles.art} imageStyle={styles.artImage}>
        <LinearGradient colors={['rgba(4,10,8,0.02)', 'rgba(4,10,8,0.22)', 'rgba(4,10,8,0.94)']} style={styles.artOverlay}>
          <View style={styles.heroTop}><View style={styles.regionBadge}><Feather name='compass' color={colors.goldSoft} size={13} /><AppText variant='caption' color={colors.goldSoft}>{t(`regions.${journey.regionId}`)}</AppText></View>{completed ? <View style={styles.completeBadge}><Feather name='check' color={colors.black} size={16} /><AppText variant='caption' color={colors.black}>{t('common.complete')}</AppText></View> : null}</View>
          <View style={styles.heroCopy}><AppText variant='display'>{t(journey.nameKey)}</AppText><AppText color='rgba(247,240,222,0.76)'>{t(journey.storyKey)}</AppText></View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.meta}>
        <Meta icon='trending-up' label={t('route.difficulty')} value={t(`difficulty.${journey.difficulty}`)} />
        <Meta icon='navigation' label={t('route.estimatedLabel')} value={t('route.estimated', { count: journey.virtualSteps.toLocaleString() })} />
        <Meta icon='gift' label={t('route.rewards')} value={`${journey.rewards[0]?.amount ?? 0} ${t('common.xp')}`} />
      </View>

      {unlocked ? <Card tone='glass' style={styles.progressCard}><View style={styles.progressRow}><View><AppText variant='caption' color={colors.muted}>{t('home.journeyProgress')}</AppText><AppText variant='heading'>{percent}%</AppText></View><AppText variant='caption' color={colors.goldSoft}>{current.toLocaleString()} / {journey.virtualSteps.toLocaleString()}</AppText></View><ProgressBar value={current} max={journey.virtualSteps} /></Card> : <Card style={styles.locked}><View style={styles.lockIcon}><Feather name='lock' color={colors.goldSoft} size={20} /></View><AppText style={styles.flex}>{t('route.selectLocked')}</AppText></Card>}

      <View style={styles.sectionTitle}><View><AppText variant='heading'>{t('route.checkpoints')}</AppText><AppText variant='caption' color={colors.muted}>{t('route.checkpointSubtitle')}</AppText></View><Feather name='book-open' color={colors.gold} size={20} /></View>
      <View>{journey.checkpoints.map((checkpoint, index) => {
        const reached = current >= checkpoint.atSteps;
        const claimed = progress.claimedCheckpointIds.includes(checkpoint.id);
        return <View key={checkpoint.id} style={styles.checkpoint}>
          <View style={styles.timeline}><View style={[styles.marker, reached && styles.markerReached]}>{reached ? <Feather name='check' size={14} color={colors.black} /> : <AppText variant='caption' color={colors.muted}>{index + 1}</AppText>}</View>{index < journey.checkpoints.length - 1 ? <View style={[styles.line, reached && styles.lineReached]} /> : null}</View>
          <Card tone={reached ? 'parchment' : 'glass'} style={styles.checkpointCard}><View style={styles.checkpointHeader}><AppText variant='label' color={reached ? colors.parchmentInk : colors.muted}>{t(checkpoint.nameKey)}</AppText>{claimed ? <Feather name='bookmark' color={colors.copper} size={16} /> : null}</View><AppText variant='caption' color={reached ? 'rgba(42,36,28,0.72)' : colors.muted}>{t(checkpoint.storyKey)}</AppText><View style={styles.checkpointReward}><Feather name={checkpoint.reward.kind === 'story' ? 'book-open' : 'hexagon'} color={reached ? colors.copper : colors.goldSoft} size={13} /><AppText variant='caption' color={reached ? colors.copper : colors.goldSoft}>{checkpoint.reward.kind === 'story' ? t('collectibles.legendFragment') : `+${checkpoint.reward.amount} ${t('common.coins')}`}</AppText><AppText variant='caption' color={reached ? 'rgba(42,36,28,0.55)' : colors.muted}>· {checkpoint.atSteps.toLocaleString()} {t('common.steps')}</AppText></View></Card>
        </View>;
      })}</View>
      <AppText variant='caption' color={colors.muted} style={styles.disclaimer}>{t('route.disclaimer')}</AppText>
      <PrimaryButton disabled={!unlocked} label={selected ? t('route.continue') : t('route.start')} onPress={select} />
    </Screen>
  );
}

function Meta({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value: string }) {
  return <View style={styles.metaItem}><Feather name={icon} color={colors.goldSoft} size={17} /><AppText variant='caption' color={colors.muted}>{label}</AppText><AppText variant='label' style={styles.metaValue}>{value}</AppText></View>;
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md }, back: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, spacer: { width: 42 },
  art: { height: 430, marginHorizontal: -spacing.lg, overflow: 'hidden' }, artImage: { opacity: 0.96 }, artOverlay: { flex: 1, padding: spacing.lg, justifyContent: 'space-between' }, heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, regionBadge: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(5,14,11,0.72)', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border }, completeBadge: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.goldSoft, borderRadius: radius.pill }, heroCopy: { gap: spacing.sm },
  meta: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.lg }, metaItem: { flex: 1, minWidth: 0, gap: 3, padding: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border }, metaValue: { fontSize: 13, lineHeight: 16 },
  progressCard: { gap: spacing.md }, progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }, locked: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' }, lockIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(201,154,66,0.1)', alignItems: 'center', justifyContent: 'center' }, flex: { flex: 1 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.lg }, checkpoint: { flexDirection: 'row', minHeight: 140 }, timeline: { width: 42, alignItems: 'center' }, marker: { width: 31, height: 31, borderRadius: 16, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, markerReached: { backgroundColor: colors.goldSoft }, line: { width: 1, flex: 1, backgroundColor: colors.border }, lineReached: { backgroundColor: colors.gold }, checkpointCard: { flex: 1, alignSelf: 'flex-start', gap: spacing.sm, marginBottom: spacing.md }, checkpointHeader: { flexDirection: 'row', justifyContent: 'space-between' }, checkpointReward: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.xs }, disclaimer: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: spacing.lg, marginTop: spacing.sm },
});
