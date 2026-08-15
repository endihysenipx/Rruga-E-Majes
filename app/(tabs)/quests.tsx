import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { quests } from '@/data/seed';
import type { Quest } from '@/domain/models';
import { questProgress } from '@/store/selectors';
import { useGameStore } from '@/store/useGameStore';
import { colors, spacing } from '@/theme/tokens';

export default function QuestsScreen() {
  const { t } = useTranslation();
  const state = useGameStore();
  const daily = quests.filter((quest) => quest.cadence === 'daily');
  const weekly = quests.filter((quest) => quest.cadence === 'weekly');
  return (
    <Screen>
      <View style={styles.header}><AppText variant="title">{t('questsScreen.title')}</AppText><AppText color={colors.muted}>{t('questsScreen.subtitle')}</AppText></View>
      <QuestGroup title={t('questsScreen.daily')} items={daily} state={state} />
      <QuestGroup title={t('questsScreen.weekly')} items={weekly} state={state} />
    </Screen>
  );
}

function QuestGroup({ title, items, state }: { title: string; items: Quest[]; state: ReturnType<typeof useGameStore.getState> }) {
  const { t } = useTranslation();
  return <View style={styles.group}><AppText variant="heading">{title}</AppText>{items.map((quest) => {
    const value = Math.min(questProgress(quest, state), quest.target);
    const done = value >= quest.target;
    return <Card key={quest.id} style={styles.card}>
      <View style={[styles.icon, done && styles.iconDone]}><Feather name={done ? 'check' : 'flag'} color={done ? colors.black : colors.goldSoft} size={18} /></View>
      <View style={styles.flex}><View style={styles.row}><AppText variant="label" style={styles.flex}>{t(quest.titleKey)}</AppText><AppText variant="caption" color={colors.goldSoft}>+{quest.reward.amount} {t('common.xp')}</AppText></View><AppText variant="caption" color={colors.muted}>{t(quest.descriptionKey)}</AppText><ProgressBar compact value={value} max={quest.target} /><AppText variant="caption" color={colors.muted}>{t('questsScreen.progress', { current: value.toLocaleString(), target: quest.target.toLocaleString() })}</AppText></View>
    </Card>;
  })}</View>;
}

const styles = StyleSheet.create({ header: { gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.xl }, group: { gap: spacing.md, marginBottom: spacing.xl }, card: { flexDirection: 'row', gap: spacing.md }, icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.emerald, alignItems: 'center', justifyContent: 'center' }, iconDone: { backgroundColor: colors.goldSoft }, flex: { flex: 1 }, row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm } });
