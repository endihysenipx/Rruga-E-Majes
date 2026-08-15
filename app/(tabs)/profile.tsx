import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { StatCard } from '@/components/profile/StatCard';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { visualAssets } from '@/config/assets';
import type { Language } from '@/domain/models';
import { useGameStore } from '@/store/useGameStore';
import { colors, radius, spacing } from '@/theme/tokens';

const avatarIcons = { arin: 'navigation', bora: 'book-open', drini: 'shield' } as const;

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const state = useGameStore();
  const avatarId = state.profile.avatarId as keyof typeof visualAssets.avatars;
  const avatar = visualAssets.avatars[avatarId] ?? visualAssets.avatars.arin;
  const levelProgress = state.profile.xp % 250;
  return (
    <Screen>
      <ImageBackground source={visualAssets.journeyArtwork.kosovo} resizeMode='cover' style={styles.hero} imageStyle={styles.heroImage}>
        <LinearGradient colors={['rgba(5,12,10,0.08)', 'rgba(5,12,10,0.92)']} style={styles.heroOverlay}>
          <View style={styles.heroTop}><AppText variant='caption' color={colors.goldSoft}>{t('profile.travelerRecord').toLocaleUpperCase()}</AppText><View style={styles.coin}><Feather name='hexagon' color={colors.goldSoft} size={14} /><AppText variant='label'>{state.profile.coins}</AppText></View></View>
          <View style={styles.identity}><LinearGradient colors={avatar.colors} style={styles.avatar}><Feather name={avatarIcons[avatarId] ?? 'navigation'} color={colors.ink} size={29} /></LinearGradient><View style={styles.flex}><AppText variant='title'>{t(`onboarding.avatars.${avatarId}`)}</AppText><AppText color={colors.goldSoft}>{t('common.level', { level: state.profile.level })} · {state.profile.xp} {t('common.xp')}</AppText><View style={styles.levelBar}><ProgressBar compact value={levelProgress} max={250} /></View></View></View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.sectionTitle}><View><AppText variant='heading'>{t('profile.lifetime')}</AppText><AppText variant='caption' color={colors.muted}>{t('profile.lifetimeHint')}</AppText></View><Feather name='activity' color={colors.gold} size={20} /></View>
      <View style={styles.stats}>
        <StatCard value={state.progress.totalSteps.toLocaleString()} label={t('profile.totalSteps')} />
        <StatCard value={state.progress.totalDistanceKm.toFixed(1)} label={t('profile.distance')} />
        <StatCard value={String(state.progress.completedJourneyIds.length)} label={t('profile.peaks')} />
        <StatCard value={String(state.progress.streak)} label={t('profile.streak')} />
      </View>

      <Pressable onPress={() => router.push('/achievements')}><Card tone='glass' style={styles.linkCard}><View style={styles.badge}><Feather name='award' color={colors.goldSoft} size={24} /></View><View style={styles.flex}><AppText variant='label'>{t('profile.achievements')}</AppText><AppText variant='caption' color={colors.muted}>{t('profile.viewAll')}</AppText></View><Feather name='chevron-right' color={colors.goldSoft} size={22} /></Card></Pressable>

      <View style={styles.sectionTitle}><View><AppText variant='heading'>{t('profile.collection')}</AppText><AppText variant='caption' color={colors.muted}>{t('profile.collectionHint')}</AppText></View><AppText variant='label' color={colors.goldSoft}>{state.inventory.length}</AppText></View>
      {state.inventory.length > 0 ? <View style={styles.collection}>{state.inventory.slice(0, 4).map((item) => <Card key={item.id} tone='parchment' style={styles.collectible}><View style={styles.collectibleIcon}><Feather name='book-open' color={colors.parchment} size={19} /></View><AppText variant='label' color={colors.parchmentInk}>{t(item.nameKey)}</AppText><AppText variant='caption' color='rgba(42,36,28,0.58)'>{t('profile.legendFound')}</AppText></Card>)}</View> : <Card tone='glass' style={styles.emptyCollection}><View style={styles.emptyIcon}><Feather name='lock' color={colors.muted} size={20} /></View><View style={styles.flex}><AppText variant='label'>{t('profile.noCollectibles')}</AppText><AppText variant='caption' color={colors.muted}>{t('profile.noCollectiblesHint')}</AppText></View></Card>}

      <AppText variant='heading' style={styles.settingsTitle}>{t('profile.settings')}</AppText>
      <Card tone='glass' style={styles.settings}>
        <View style={styles.settingRow}><View style={styles.flex}><AppText variant='label'>{t('profile.language')}</AppText><AppText variant='caption' color={colors.muted}>{state.profile.language === 'sq' ? 'Shqip' : 'English'}</AppText></View><View style={styles.languages}>{(['sq', 'en'] as Language[]).map((language) => <Pressable key={language} onPress={() => state.setLanguage(language)} style={[styles.language, state.profile.language === language && styles.languageActive]}><AppText variant='caption' color={state.profile.language === language ? colors.black : colors.muted}>{language.toUpperCase()}</AppText></Pressable>)}</View></View>
        <View style={styles.divider} />
        <View style={styles.settingRow}><View style={styles.flex}><AppText variant='label'>{t('profile.health')}</AppText><AppText variant='caption' color={colors.muted}>{t('profile.mock')}</AppText></View><View style={styles.demoBadge}><Feather name='activity' color={colors.ember} size={16} /><AppText variant='caption' color={colors.ember}>DEMO</AppText></View></View>
      </Card>
      <AppText variant='caption' color={colors.muted} style={styles.privacy}>{t('profile.privacy')}</AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { height: 330, marginHorizontal: -spacing.lg }, heroImage: { opacity: 0.88 }, heroOverlay: { flex: 1, justifyContent: 'space-between', padding: spacing.lg }, heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, coin: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(5,14,11,0.68)', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border }, identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, avatar: { width: 78, height: 78, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }, flex: { flex: 1 }, levelBar: { marginTop: spacing.sm, maxWidth: 190 },
  sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.md }, stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, linkCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg }, badge: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.emerald, alignItems: 'center', justifyContent: 'center' },
  collection: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, collectible: { width: '47%', gap: spacing.xs }, collectibleIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.copper, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }, emptyCollection: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' }, emptyIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  settingsTitle: { marginTop: spacing.xl, marginBottom: spacing.md }, settings: { gap: spacing.md }, settingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, languages: { flexDirection: 'row', padding: 3, backgroundColor: colors.canvas, borderRadius: radius.pill }, language: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill }, languageActive: { backgroundColor: colors.goldSoft }, divider: { height: 1, backgroundColor: colors.border }, demoBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: 'rgba(232,141,77,0.1)' }, privacy: { textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.md },
});
