import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { RewardReveal } from '@/components/game/RewardReveal';
import { WalkingStage } from '@/components/game/WalkingStage';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { quests } from '@/data/seed';
import { progressPercent } from '@/domain/gameLogic';
import { isQuestClaimed, questProgress } from '@/store/selectors';
import { selectCurrentJourney, useGameStore } from '@/store/useGameStore';
import { colors, radius, spacing } from '@/theme/tokens';

export default function JourneyHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isWalking, setIsWalking] = useState(false);
  const walkTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const journey = useGameStore(selectCurrentJourney);
  const state = useGameStore();
  const currentSteps = state.progress.journeySteps[journey.id] ?? 0;
  const dailyQuests = quests.filter((quest) => quest.cadence === 'daily');
  const dailyQuest = dailyQuests.find((quest) => !isQuestClaimed(quest, state) && questProgress(quest, state) < quest.target) ?? dailyQuests[0]!;
  const questValue = Math.min(questProgress(dailyQuest, state), dailyQuest.target);
  const questDone = questValue >= dailyQuest.target;
  const questClaimed = isQuestClaimed(dailyQuest, state);
  const nextCheckpoint = journey.checkpoints.find((checkpoint) => currentSteps < checkpoint.atSteps);

  useEffect(() => () => {
    if (walkTimer.current) clearTimeout(walkTimer.current);
  }, []);

  const takeDemoWalk = async () => {
    if (isWalking || state.isSyncing) return;
    setIsWalking(true);
    await state.syncSteps();
    walkTimer.current = setTimeout(() => setIsWalking(false), 4_600);
  };

  return (
    <Screen>
      <RewardReveal reward={isWalking ? undefined : state.rewardMoment} onClose={state.dismissReward} />
      <View style={styles.topbar}>
        <View style={styles.avatar}><AppText variant='heading' color={colors.goldSoft}>{state.profile.avatarId.slice(0, 1).toUpperCase()}</AppText></View>
        <View style={styles.welcome}><AppText variant='caption' color={colors.goldSoft}>{t('home.greeting')}</AppText><AppText variant='heading'>{t('common.level', { level: state.profile.level })}</AppText></View>
        <View style={styles.currency}><Feather name='hexagon' color={colors.goldSoft} size={16} /><AppText variant='label'>{state.profile.coins}</AppText></View>
      </View>

      <WalkingStage
        journey={journey}
        currentSteps={currentSteps}
        avatarId={state.profile.avatarId}
        isWalking={isWalking}
        lastStepDelta={state.lastStepDelta}
        onOpenJourney={() => router.push(`/journey/${journey.id}`)}
      />

      {state.errorMessage ? <Card style={styles.error}><Feather name='alert-circle' color={colors.danger} size={18} /><AppText style={styles.flex}>{t(state.errorMessage)}</AppText></Card> : null}
      <PrimaryButton label={isWalking ? t('walkingScene.walking') : state.isSyncing ? t('home.syncing') : t('home.sync')} loading={state.isSyncing || isWalking} onPress={() => void takeDemoWalk()} />
      <AppText variant='caption' color={colors.muted} style={styles.hint}>{t('home.demoHint')}</AppText>

      <View style={styles.statStrip}>
        <View style={styles.stat}><Feather name='navigation' color={colors.goldSoft} size={18} /><View><AppText variant='stat'>{state.dailyGoal.todaySteps.toLocaleString()}</AppText><AppText variant='caption' color={colors.muted}>{t('home.today')}</AppText></View></View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Feather name='sunrise' color={colors.ember} size={18} /><View><AppText variant='stat'>{state.progress.streak}</AppText><AppText variant='caption' color={colors.muted}>{t('home.streak')}</AppText></View></View>
      </View>

      <Card tone='glass' style={styles.goalCard}>
        <View style={styles.goalHeader}><View><AppText variant='caption' color={colors.muted}>{t('home.dailyGoal')}</AppText><AppText variant='heading'>{state.dailyGoal.todaySteps.toLocaleString()} / {state.dailyGoal.targetSteps.toLocaleString()}</AppText></View><View style={styles.goalSeal}><AppText variant='label' color={colors.black}>{Math.round(progressPercent(state.dailyGoal.todaySteps, state.dailyGoal.targetSteps))}%</AppText></View></View>
        <ProgressBar value={state.dailyGoal.todaySteps} max={state.dailyGoal.targetSteps} />
      </Card>

      <SectionTitle icon='map-pin' title={t('home.nextChapter')} />
      <Pressable onPress={() => router.push(`/journey/${journey.id}`)}>
        <Card tone='glass' style={styles.chapterCard}>
          <View style={styles.chapterIcon}><Feather name={nextCheckpoint ? 'map-pin' : 'flag'} color={colors.goldSoft} size={23} /></View>
          <View style={styles.flex}><AppText variant='label'>{nextCheckpoint ? t(nextCheckpoint.nameKey) : t('common.complete')}</AppText><AppText variant='caption' color={colors.muted}>{nextCheckpoint ? t('home.untilChapter', { count: Math.max(0, nextCheckpoint.atSteps - currentSteps).toLocaleString() }) : t('rewards.routeComplete')}</AppText></View>
          <Feather name='chevron-right' color={colors.goldSoft} size={22} />
        </Card>
      </Pressable>

      <SectionTitle icon='star' title={t('home.questTitle')} />
      <LinearGradient colors={['rgba(65,103,82,0.34)', 'rgba(16,35,30,0.92)']} style={styles.quest}>
        <View style={styles.questTop}><View style={styles.questIcon}><Feather name='sunrise' color={colors.goldSoft} size={22} /></View><View style={styles.flex}><AppText variant='label'>{t(dailyQuest.titleKey)}</AppText><AppText variant='caption' color={colors.muted}>{t(dailyQuest.descriptionKey)}</AppText></View><AppText variant='caption' color={colors.goldSoft}>+{dailyQuest.reward.amount} {t('common.xp')}</AppText></View>
        <ProgressBar compact value={questValue} max={dailyQuest.target} />
        <View style={styles.questBottom}><AppText variant='caption' color={colors.muted}>{t('questsScreen.progress', { current: questValue.toLocaleString(), target: dailyQuest.target.toLocaleString() })}</AppText>{questDone ? <Pressable disabled={questClaimed} onPress={() => state.claimQuest(dailyQuest.id)} style={[styles.claim, questClaimed && styles.claimed]}><AppText variant='caption' color={questClaimed ? colors.muted : colors.black}>{t(questClaimed ? 'questsScreen.claimed' : 'questsScreen.claim')}</AppText></Pressable> : null}</View>
      </LinearGradient>
    </Screen>
  );
}

function SectionTitle({ icon, title }: { icon: keyof typeof Feather.glyphMap; title: string }) {
  return <View style={styles.sectionTitle}><AppText variant='heading'>{title}</AppText><Feather name={icon} color={colors.gold} size={19} /></View>;
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md }, avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.emerald, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, welcome: { flex: 1 }, currency: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: colors.surface, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  statStrip: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg }, stat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md }, statDivider: { width: 1, height: 42, backgroundColor: colors.border, marginHorizontal: spacing.md },
  goalCard: { gap: spacing.md, marginBottom: spacing.md }, goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, goalSeal: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  error: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.md }, flex: { flex: 1 }, hint: { textAlign: 'center', marginTop: spacing.sm }, sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.md },
  chapterCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, chapterIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(201,154,66,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  quest: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.md }, questTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, questIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.emerald, alignItems: 'center', justifyContent: 'center' }, questBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  claim: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.goldSoft, borderRadius: radius.pill }, claimed: { backgroundColor: colors.surfaceRaised },
});
