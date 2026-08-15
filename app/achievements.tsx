import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { achievements } from '@/data/seed';
import { useGameStore } from '@/store/useGameStore';
import { colors, radius, spacing } from '@/theme/tokens';

export default function AchievementsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const earnedIds = useGameStore((state) => state.progress.earnedAchievementIds);
  return (
    <Screen>
      <View style={styles.nav}><Pressable onPress={() => router.back()} style={styles.back}><Feather name='arrow-left' color={colors.ink} size={22} /></Pressable><View style={styles.flex}><AppText variant='title'>{t('achievementsScreen.title')}</AppText><AppText color={colors.muted}>{t('achievementsScreen.subtitle')}</AppText></View></View>
      <LinearGradient colors={['#3E624E', '#142A23']} style={styles.summary}><View style={styles.seal}><Feather name='award' color={colors.black} size={28} /></View><View style={styles.flex}><AppText variant='caption' color={colors.goldSoft}>{t('achievementsScreen.collectionProgress')}</AppText><AppText variant='heading'>{t('achievementsScreen.earned', { count: earnedIds.length })}</AppText><ProgressBar compact value={earnedIds.length} max={achievements.length} /></View><AppText variant='stat' color={colors.goldSoft}>{Math.round((earnedIds.length / achievements.length) * 100)}%</AppText></LinearGradient>
      <View style={styles.grid}>{achievements.map((achievement) => {
        const earned = earnedIds.includes(achievement.id);
        return <Card key={achievement.id} tone={earned ? 'parchment' : 'glass'} style={[styles.card, !earned && styles.cardLocked]}>
          <View style={[styles.badge, earned && styles.badgeEarned]}><Feather name={earned ? 'award' : 'lock'} color={earned ? colors.parchment : colors.muted} size={25} /></View>
          <AppText variant='label' color={earned ? colors.parchmentInk : colors.muted}>{t(achievement.titleKey)}</AppText>
          <AppText variant='caption' color={earned ? 'rgba(42,36,28,0.62)' : colors.muted}>{earned ? t(achievement.descriptionKey) : t('achievementsScreen.hidden')}</AppText>
        </Card>;
      })}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', paddingVertical: spacing.lg }, back: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, flex: { flex: 1 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl }, seal: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, card: { width: '47%', minHeight: 184, gap: spacing.sm }, cardLocked: { opacity: 0.62 }, badge: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }, badgeEarned: { backgroundColor: colors.copper },
});
