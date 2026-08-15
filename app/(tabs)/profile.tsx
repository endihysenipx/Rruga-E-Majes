import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { StatCard } from '@/components/profile/StatCard';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { visualAssets } from '@/config/assets';
import type { Language } from '@/domain/models';
import { useGameStore } from '@/store/useGameStore';
import { colors, radius, spacing } from '@/theme/tokens';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const state = useGameStore();
  const avatar = visualAssets.avatars[state.profile.avatarId as keyof typeof visualAssets.avatars] ?? visualAssets.avatars.arin;
  return (
    <Screen>
      <View style={styles.header}>
        <LinearGradient colors={avatar.colors} style={styles.avatar}><AppText variant="display">{avatar.glyph}</AppText></LinearGradient>
        <View style={styles.flex}><AppText variant="title">{t('profile.title')}</AppText><AppText color={colors.goldSoft}>{t('common.level', { level: state.profile.level })} · {state.profile.xp} {t('common.xp')}</AppText></View>
      </View>
      <AppText variant="heading" style={styles.sectionTitle}>{t('profile.lifetime')}</AppText>
      <View style={styles.stats}>
        <StatCard value={state.progress.totalSteps.toLocaleString()} label={t('profile.totalSteps')} />
        <StatCard value={state.progress.totalDistanceKm.toFixed(1)} label={t('profile.distance')} />
        <StatCard value={String(state.progress.completedJourneyIds.length)} label={t('profile.peaks')} />
        <StatCard value={String(state.progress.streak)} label={t('profile.streak')} />
      </View>

      <Pressable onPress={() => router.push('/achievements')}><Card style={styles.linkCard}><View style={styles.badge}><Feather name="award" color={colors.goldSoft} size={24} /></View><View style={styles.flex}><AppText variant="label">{t('profile.achievements')}</AppText><AppText variant="caption" color={colors.muted}>{t('profile.viewAll')}</AppText></View><Feather name="chevron-right" color={colors.goldSoft} size={22} /></Card></Pressable>

      <AppText variant="heading" style={styles.sectionTitle}>{t('profile.settings')}</AppText>
      <Card style={styles.settings}>
        <View style={styles.settingRow}><View style={styles.flex}><AppText variant="label">{t('profile.language')}</AppText><AppText variant="caption" color={colors.muted}>{state.profile.language === 'sq' ? 'Shqip' : 'English'}</AppText></View><View style={styles.languages}>{(['sq', 'en'] as Language[]).map((language) => <Pressable key={language} onPress={() => state.setLanguage(language)} style={[styles.language, state.profile.language === language && styles.languageActive]}><AppText variant="caption" color={state.profile.language === language ? colors.black : colors.muted}>{language.toUpperCase()}</AppText></Pressable>)}</View></View>
        <View style={styles.divider} />
        <View style={styles.settingRow}><View style={styles.flex}><AppText variant="label">{t('profile.health')}</AppText><AppText variant="caption" color={colors.muted}>{t('profile.mock')}</AppText></View><Feather name="activity" color={colors.goldSoft} size={20} /></View>
      </Card>
      <AppText variant="caption" color={colors.muted} style={styles.privacy}>{t('profile.privacy')}</AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }, avatar: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' }, flex: { flex: 1 }, sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.md }, stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, linkCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg }, badge: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.emerald, alignItems: 'center', justifyContent: 'center' }, settings: { gap: spacing.md }, settingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, languages: { flexDirection: 'row', padding: 3, backgroundColor: colors.canvas, borderRadius: radius.pill }, language: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill }, languageActive: { backgroundColor: colors.goldSoft }, divider: { height: 1, backgroundColor: colors.border }, privacy: { textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.md } });
