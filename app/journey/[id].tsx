import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { journeys } from '@/data/seed';
import { useGameStore } from '@/store/useGameStore';
import { colors, spacing } from '@/theme/tokens';

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
  const current = progress.journeySteps[journey.id] ?? 0;

  const select = () => {
    chooseJourney(journey.id);
    router.replace('/(tabs)');
  };

  return (
    <Screen>
      <View style={styles.nav}><Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Feather name="arrow-left" color={colors.ink} size={22} /></Pressable><AppText variant="label">{t('route.virtualJourney')}</AppText><View style={styles.spacer} /></View>
      <LinearGradient colors={journey.colors} style={styles.art}><View style={styles.sun} /><View style={styles.peak} /><View style={styles.title}><AppText variant="display">{t(journey.nameKey)}</AppText><AppText color="rgba(255,255,255,0.78)">{t(journey.storyKey)}</AppText></View></LinearGradient>
      <View style={styles.meta}>
        <View><AppText variant="caption" color={colors.muted}>{t('route.difficulty')}</AppText><AppText variant="label">{t(`difficulty.${journey.difficulty}`)}</AppText></View>
        <View><AppText variant="caption" color={colors.muted}>{t('route.estimated')}</AppText><AppText variant="label">{journey.virtualSteps.toLocaleString()}</AppText></View>
        <View><AppText variant="caption" color={colors.muted}>{t('route.rewards')}</AppText><AppText variant="label">{journey.rewards[0]?.amount ?? 0} {t('common.xp')}</AppText></View>
      </View>
      {unlocked ? <Card style={styles.progress}><View style={styles.progressRow}><AppText variant="label">{t('home.journeyProgress')}</AppText><AppText variant="caption" color={colors.goldSoft}>{current.toLocaleString()} / {journey.virtualSteps.toLocaleString()}</AppText></View><ProgressBar value={current} max={journey.virtualSteps} /></Card> : <Card style={styles.locked}><Feather name="lock" color={colors.goldSoft} size={20} /><AppText style={styles.flex}>{t('route.selectLocked')}</AppText></Card>}

      <AppText variant="heading" style={styles.sectionTitle}>{t('route.checkpoints')}</AppText>
      <View>{journey.checkpoints.map((checkpoint, index) => {
        const reached = current >= checkpoint.atSteps;
        return <View key={checkpoint.id} style={styles.checkpoint}><View style={styles.timeline}><View style={[styles.marker, reached && styles.markerReached]}>{reached ? <Feather name="check" size={13} color={colors.black} /> : <AppText variant="caption" color={colors.muted}>{index + 1}</AppText>}</View>{index < journey.checkpoints.length - 1 ? <View style={styles.line} /> : null}</View><View style={styles.checkpointBody}><AppText variant="label" color={reached ? colors.ink : colors.muted}>{t(checkpoint.nameKey)}</AppText><AppText variant="caption" color={colors.muted}>{t(checkpoint.storyKey)}</AppText><AppText variant="caption" color={colors.goldSoft}>{checkpoint.atSteps.toLocaleString()} {t('common.steps')}</AppText></View></View>;
      })}</View>
      <AppText variant="caption" color={colors.muted} style={styles.disclaimer}>{t('route.disclaimer')}</AppText>
      <PrimaryButton disabled={!unlocked} label={selected ? t('route.continue') : t('route.start')} onPress={select} />
    </Screen>
  );
}

const styles = StyleSheet.create({ nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md }, back: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, spacer: { width: 42 }, art: { height: 300, marginHorizontal: -spacing.lg, overflow: 'hidden', justifyContent: 'flex-end', padding: spacing.lg }, sun: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(239,211,140,0.18)', right: 38, top: 35 }, peak: { position: 'absolute', width: 300, height: 300, backgroundColor: 'rgba(5,18,16,0.5)', transform: [{ rotate: '45deg' }], left: 20, top: 140 }, title: { gap: spacing.sm, zIndex: 2 }, meta: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.lg }, progress: { gap: spacing.md }, progressRow: { flexDirection: 'row', justifyContent: 'space-between' }, locked: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' }, flex: { flex: 1 }, sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.lg }, checkpoint: { flexDirection: 'row', minHeight: 105 }, timeline: { width: 42, alignItems: 'center' }, marker: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, markerReached: { backgroundColor: colors.goldSoft }, line: { width: 1, flex: 1, backgroundColor: colors.border }, checkpointBody: { flex: 1, gap: spacing.xs, paddingBottom: spacing.lg }, disclaimer: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: spacing.lg, marginTop: spacing.sm },
});
