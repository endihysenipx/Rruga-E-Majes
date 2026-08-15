import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { visualAssets } from '@/config/assets';
import type { Language } from '@/domain/models';
import { getStepProvider } from '@/services/steps/providerRegistry';
import { useGameStore } from '@/store/useGameStore';
import { colors, radius, spacing } from '@/theme/tokens';

const avatarIds = ['arin', 'bora', 'drini'] as const;
const avatarIcons = { arin: 'navigation', bora: 'book-open', drini: 'shield' } as const;

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [requesting, setRequesting] = useState(false);
  const language = useGameStore((state) => state.profile.language);
  const avatar = useGameStore((state) => state.profile.avatarId);
  const setLanguage = useGameStore((state) => state.setLanguage);
  const setAvatar = useGameStore((state) => state.setAvatar);
  const finish = useGameStore((state) => state.finishOnboarding);

  const complete = () => { finish(); router.replace('/(tabs)'); };
  const request = async () => { setRequesting(true); await getStepProvider().requestPermission(); setRequesting(false); complete(); };

  return (
    <Screen>
      <ImageBackground source={visualAssets.onboarding} resizeMode='cover' style={styles.art}>
        <LinearGradient colors={['rgba(4,10,8,0.02)', 'rgba(4,10,8,0.2)', 'rgba(4,10,8,0.94)']} style={styles.artOverlay}>
          <View style={styles.brand}><View style={styles.brandMark}><Feather name='navigation' color={colors.black} size={18} /></View><AppText variant='label' color={colors.goldSoft}>{t('common.appName')}</AppText></View>
          <View style={styles.artCopy}><AppText variant='caption' color={colors.goldSoft}>{t('onboarding.eyebrow').toLocaleUpperCase()}</AppText><AppText variant='display'>{t('onboarding.title')}</AppText><AppText color='rgba(247,240,222,0.74)'>{t('onboarding.body')}</AppText></View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.dots}>{[0, 1, 2].map((item) => <View key={item} style={[styles.dot, page === item && styles.dotActive]} />)}</View>

      {page === 0 ? <View style={styles.section}>
        <View><AppText variant='heading'>{t('onboarding.language')}</AppText><AppText variant='caption' color={colors.muted}>{t('onboarding.languageHint')}</AppText></View>
        <View style={styles.row}>{(['sq', 'en'] as Language[]).map((item) => <Choice key={item} selected={language === item} label={item === 'sq' ? 'Shqip' : 'English'} onPress={() => setLanguage(item)} />)}</View>
        <PrimaryButton label={t('common.continue')} onPress={() => setPage(1)} />
      </View> : null}

      {page === 1 ? <View style={styles.section}>
        <View><AppText variant='heading'>{t('onboarding.avatar')}</AppText><AppText variant='caption' color={colors.muted}>{t('onboarding.avatarHint')}</AppText></View>
        <View style={styles.avatars}>{avatarIds.map((id) => {
          const config = visualAssets.avatars[id];
          const selected = avatar === id;
          return <Pressable key={id} onPress={() => setAvatar(id)} style={[styles.avatarChoice, selected && styles.selected]}>
            <LinearGradient colors={config.colors} style={styles.avatar}><Feather name={avatarIcons[id]} color={colors.ink} size={24} /></LinearGradient>
            <View style={styles.avatarLabel}><AppText variant='label'>{t(`onboarding.avatars.${id}`)}</AppText><AppText variant='caption' color={colors.muted}>{t(`onboarding.avatarStories.${id}`)}</AppText></View>
            {selected ? <View style={styles.check}><Feather name='check' color={colors.black} size={14} /></View> : null}
          </Pressable>;
        })}</View>
        <PrimaryButton label={t('common.continue')} onPress={() => setPage(2)} />
        <PrimaryButton label={t('common.back')} variant='ghost' onPress={() => setPage(0)} />
      </View> : null}

      {page === 2 ? <View style={styles.section}>
        <View><AppText variant='heading'>{t('onboarding.permissionTitle')}</AppText><AppText color={colors.muted}>{t('onboarding.permissionBody')}</AppText></View>
        <LinearGradient colors={['rgba(47,100,78,0.42)', 'rgba(16,35,30,0.9)']} style={styles.permissionCard}><View style={styles.permissionIcon}><Feather name='activity' color={colors.goldSoft} size={30} /></View><View style={styles.permissionCopy}><AppText variant='label'>{t('onboarding.onDevice')}</AppText><AppText variant='caption' color={colors.muted}>{t('onboarding.onDeviceBody')}</AppText></View></LinearGradient>
        <PrimaryButton loading={requesting} label={t('onboarding.enableSteps')} onPress={() => void request()} />
        <PrimaryButton label={t('onboarding.demoMode')} variant='ghost' onPress={complete} />
      </View> : null}
    </Screen>
  );
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.choice, selected && styles.selected]}><AppText variant='label' color={selected ? colors.goldSoft : colors.ink}>{label}</AppText>{selected ? <Feather name='check-circle' color={colors.goldSoft} size={17} /> : null}</Pressable>;
}

const styles = StyleSheet.create({
  art: { height: 470, marginHorizontal: -spacing.lg, overflow: 'hidden' }, artOverlay: { flex: 1, justifyContent: 'space-between', padding: spacing.lg }, brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, brandMark: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' }, artCopy: { gap: spacing.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginVertical: spacing.lg }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.stone }, dotActive: { width: 28, backgroundColor: colors.goldSoft }, section: { gap: spacing.md }, row: { flexDirection: 'row', gap: spacing.md }, choice: { flex: 1, height: 58, flexDirection: 'row', gap: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }, selected: { borderColor: colors.gold, backgroundColor: 'rgba(201,154,66,0.1)' },
  avatars: { gap: spacing.sm }, avatarChoice: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, avatar: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, avatarLabel: { flex: 1, gap: 2 }, check: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  permissionCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border }, permissionIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(201,154,66,0.12)', alignItems: 'center', justifyContent: 'center' }, permissionCopy: { flex: 1, gap: spacing.xs },
});
