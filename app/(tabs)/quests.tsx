import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { RewardReveal } from '@/components/game/RewardReveal';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { quests } from '@/data/seed';
import type { Quest } from '@/domain/models';
import { isQuestClaimed, questProgress } from '@/store/selectors';
import { useGameStore } from '@/store/useGameStore';
import { colors, radius, spacing } from '@/theme/tokens';

export default function QuestsScreen() {
  const { t } = useTranslation();
  const state = useGameStore();
  const daily = quests.filter((quest) => quest.cadence === 'daily');
  const weekly = quests.filter((quest) => quest.cadence === 'weekly');
  const completeToday = daily.filter((quest) => questProgress(quest, state) >= quest.target).length;
  return (
    <Screen>
      <RewardReveal reward={state.rewardMoment} onClose={state.dismissReward} />
      <View style={styles.header}><View style={styles.eyebrow}><Feather name='star' color={colors.goldSoft} size={14} /><AppText variant='caption' color={colors.goldSoft}>{t('questsScreen.adventureBoard').toLocaleUpperCase()}</AppText></View><AppText variant='title'>{t('questsScreen.title')}</AppText><AppText color={colors.muted}>{t('questsScreen.subtitle')}</AppText></View>
      <LinearGradient colors={['#315846', '#142B24']} style={styles.banner}>
        <View style={styles.bannerIcon}><Feather name='sunrise' color={colors.goldSoft} size={28} /></View>
        <View style={styles.flex}><AppText variant='caption' color={colors.goldSoft}>{t('questsScreen.todayProgress')}</AppText><AppText variant='heading'>{completeToday} / {daily.length}</AppText><ProgressBar compact value={completeToday} max={daily.length} /></View>
        <View style={styles.flame}><Feather name='zap' color={colors.ember} size={22} /><AppText variant='label'>{state.progress.streak}</AppText></View>
      </LinearGradient>
      <QuestGroup title={t('questsScreen.daily')} subtitle={t('questsScreen.dailyHint')} items={daily} state={state} />
      <QuestGroup title={t('questsScreen.weekly')} subtitle={t('questsScreen.weeklyHint')} items={weekly} state={state} />
    </Screen>
  );
}

function QuestGroup({ title, subtitle, items, state }: { title: string; subtitle: string; items: Quest[]; state: ReturnType<typeof useGameStore.getState> }) {
  const { t } = useTranslation();
  return <View style={styles.group}><View><AppText variant='heading'>{title}</AppText><AppText variant='caption' color={colors.muted}>{subtitle}</AppText></View>{items.map((quest) => {
    const value = Math.min(questProgress(quest, state), quest.target);
    const done = value >= quest.target;
    const claimed = isQuestClaimed(quest, state);
    return <Card key={quest.id} tone='glass' style={[styles.card, done && !claimed && styles.cardReady]}>
      <View style={[styles.icon, done && styles.iconDone]}><Feather name={claimed ? 'check' : done ? 'gift' : 'flag'} color={done ? colors.black : colors.goldSoft} size={19} /></View>
      <View style={styles.flex}>
        <View style={styles.row}><AppText variant='label' style={styles.flex}>{t(quest.titleKey)}</AppText><View style={styles.reward}><Feather name='zap' color={colors.goldSoft} size={12} /><AppText variant='caption' color={colors.goldSoft}>+{quest.reward.amount}</AppText></View></View>
        <AppText variant='caption' color={colors.muted}>{t(quest.descriptionKey)}</AppText>
        <ProgressBar compact value={value} max={quest.target} />
        <View style={styles.row}><AppText variant='caption' color={colors.muted}>{t('questsScreen.progress', { current: value.toLocaleString(), target: quest.target.toLocaleString() })}</AppText>{done ? <Pressable disabled={claimed} onPress={() => state.claimQuest(quest.id)} style={[styles.claim, claimed && styles.claimed]}><AppText variant='caption' color={claimed ? colors.muted : colors.black}>{t(claimed ? 'questsScreen.claimed' : 'questsScreen.claim')}</AppText></Pressable> : null}</View>
      </View>
    </Card>;
  })}</View>;
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.lg }, eyebrow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, banner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl }, bannerIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(6,17,14,0.48)', alignItems: 'center', justifyContent: 'center' }, flame: { alignItems: 'center', gap: 2 },
  group: { gap: spacing.md, marginBottom: spacing.xl }, card: { flexDirection: 'row', gap: spacing.md }, cardReady: { borderColor: 'rgba(241,210,138,0.52)' }, icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.emerald, alignItems: 'center', justifyContent: 'center' }, iconDone: { backgroundColor: colors.goldSoft }, flex: { flex: 1 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }, reward: { flexDirection: 'row', alignItems: 'center', gap: 3 }, claim: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.goldSoft }, claimed: { backgroundColor: colors.surfaceRaised },
});
