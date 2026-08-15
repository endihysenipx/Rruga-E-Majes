import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MountainHero } from '@/components/journey/MountainHero';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { quests } from '@/data/seed';
import { progressPercent } from '@/domain/gameLogic';
import { questProgress } from '@/store/selectors';
import { selectCurrentJourney, useGameStore } from '@/store/useGameStore';
import { colors, radius, spacing } from '@/theme/tokens';

export default function JourneyHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const journey = useGameStore(selectCurrentJourney);
  const state = useGameStore();
  const currentSteps = state.progress.journeySteps[journey.id] ?? 0;
  const dailyQuest = quests[0]!;
  const questValue = questProgress(dailyQuest, state);
  const remaining = Math.max(0, journey.virtualSteps - currentSteps);

  return (
    <Screen>
      <View style={styles.topbar}>
        <View><AppText variant="caption" color={colors.goldSoft}>{t('home.greeting')}</AppText><AppText variant="heading">{t('common.level', { level: state.profile.level })}</AppText></View>
        <View style={styles.coin}><AppText color={colors.goldSoft}>◆</AppText><AppText variant="label">{state.profile.coins}</AppText></View>
      </View>

      <MountainHero journey={journey} title={t(journey.nameKey)} story={t(journey.storyKey)} currentSteps={currentSteps} />

      <View style={styles.stats}>
        <View><AppText variant="caption" color={colors.muted}>{t('home.today')}</AppText><AppText variant="stat">{state.dailyGoal.todaySteps.toLocaleString()}</AppText></View>
        <View style={styles.goal}><View style={styles.goalCopy}><AppText variant="caption" color={colors.muted}>{t('home.dailyGoal')}</AppText><AppText variant="label">{Math.round(progressPercent(state.dailyGoal.todaySteps, state.dailyGoal.targetSteps))}%</AppText></View><ProgressBar compact value={state.dailyGoal.todaySteps} max={state.dailyGoal.targetSteps} /></View>
      </View>

      {state.lastStepDelta > 0 ? <Card style={styles.notice}><Feather name="zap" color={colors.goldSoft} size={18} /><AppText variant="label" color={colors.goldSoft}>{t('home.synced', { count: state.lastStepDelta })}</AppText></Card> : null}
      {state.errorMessage ? <Card style={styles.error}><Feather name="alert-circle" color={colors.danger} size={18} /><AppText style={styles.flex}>{t(state.errorMessage)}</AppText></Card> : null}

      <PrimaryButton label={state.isSyncing ? t('home.syncing') : t('home.sync')} loading={state.isSyncing} onPress={() => void state.syncSteps()} />
      <AppText variant="caption" color={colors.muted} style={styles.hint}>{t('home.demoHint')}</AppText>

      <View style={styles.sectionTitle}><AppText variant="heading">{t('home.questTitle')}</AppText><Feather name="flag" color={colors.gold} size={19} /></View>
      <Card style={styles.quest}>
        <View style={styles.questIcon}><Feather name="sunrise" color={colors.goldSoft} size={22} /></View>
        <View style={styles.flex}><AppText variant="label">{t(dailyQuest.titleKey)}</AppText><AppText variant="caption" color={colors.muted}>{t(dailyQuest.descriptionKey)}</AppText><ProgressBar compact value={questValue} max={dailyQuest.target} /></View>
      </Card>

      <PressableCard onPress={() => router.push(`/journey/${journey.id}`)} title={t('home.journeyProgress')} detail={t('common.remaining', { count: remaining.toLocaleString() })} />
    </Screen>
  );
}

function PressableCard({ title, detail, onPress }: { title: string; detail: string; onPress: () => void }) {
  return <Card style={styles.routeCard}><View style={styles.flex}><AppText variant="label">{title}</AppText><AppText variant="caption" color={colors.muted}>{detail}</AppText></View><Feather name="chevron-right" color={colors.goldSoft} size={22} onPress={onPress} /></Card>;
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.lg }, coin: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.pill },
  stats: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.lg }, goal: { flex: 1, gap: spacing.sm }, goalCopy: { flexDirection: 'row', justifyContent: 'space-between' },
  notice: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md, backgroundColor: 'rgba(213,172,88,0.1)' }, error: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }, flex: { flex: 1 }, hint: { textAlign: 'center', marginTop: spacing.sm },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.md }, quest: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' }, questIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.emerald }, routeCard: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
});
