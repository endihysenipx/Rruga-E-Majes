import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { achievements } from '@/data/seed';
import { useGameStore } from '@/store/useGameStore';
import { colors, spacing } from '@/theme/tokens';

export default function AchievementsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const earnedIds = useGameStore((state) => state.progress.earnedAchievementIds);
  return (
    <Screen>
      <View style={styles.nav}><Pressable onPress={() => router.back()} style={styles.back}><Feather name="arrow-left" color={colors.ink} size={22} /></Pressable><View style={styles.flex}><AppText variant="title">{t('achievementsScreen.title')}</AppText><AppText color={colors.muted}>{t('achievementsScreen.earned', { count: earnedIds.length })}</AppText></View></View>
      <View style={styles.grid}>{achievements.map((achievement) => {
        const earned = earnedIds.includes(achievement.id);
        return <Card key={achievement.id} style={[styles.card, !earned && styles.cardLocked]}><View style={[styles.badge, earned && styles.badgeEarned]}><Feather name={earned ? 'award' : 'lock'} color={earned ? colors.black : colors.muted} size={25} /></View><AppText variant="label" color={earned ? colors.ink : colors.muted}>{t(achievement.titleKey)}</AppText><AppText variant="caption" color={colors.muted}>{earned ? t(achievement.descriptionKey) : t('achievementsScreen.hidden')}</AppText></Card>;
      })}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({ nav: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', paddingVertical: spacing.lg }, back: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, flex: { flex: 1 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, card: { width: '47%', minHeight: 175, gap: spacing.sm }, cardLocked: { opacity: 0.62 }, badge: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }, badgeEarned: { backgroundColor: colors.goldSoft } });
