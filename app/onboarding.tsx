import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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
  const request = async () => {
    setRequesting(true);
    await getStepProvider().requestPermission();
    setRequesting(false);
    complete();
  };

  return (
    <Screen>
      <LinearGradient colors={['#143C33', '#1F3D36', '#101F1C']} style={styles.art}>
        <View style={styles.moon} /><View style={[styles.peak, styles.peakOne]} /><View style={[styles.peak, styles.peakTwo]} />
        <View style={styles.artCopy}><AppText variant="caption" color={colors.goldSoft}>{t('onboarding.eyebrow').toLocaleUpperCase()}</AppText><AppText variant="display">{t('onboarding.title')}</AppText></View>
      </LinearGradient>

      <View style={styles.dots}>{[0, 1, 2].map((item) => <View key={item} style={[styles.dot, page === item && styles.dotActive]} />)}</View>

      {page === 0 ? <View style={styles.section}>
        <AppText variant="heading">{t('onboarding.language')}</AppText>
        <AppText color={colors.muted}>{t('onboarding.body')}</AppText>
        <View style={styles.row}>{(['sq', 'en'] as Language[]).map((item) => <Choice key={item} selected={language === item} label={item === 'sq' ? 'Shqip' : 'English'} onPress={() => setLanguage(item)} />)}</View>
        <PrimaryButton label={t('common.continue')} onPress={() => setPage(1)} />
      </View> : null}

      {page === 1 ? <View style={styles.section}>
        <AppText variant="heading">{t('onboarding.avatar')}</AppText>
        <View style={styles.avatars}>{avatarIds.map((id) => {
          const config = visualAssets.avatars[id];
          return <Pressable key={id} onPress={() => setAvatar(id)} style={[styles.avatarChoice, avatar === id && styles.selected]}>
            <LinearGradient colors={config.colors} style={styles.avatar}><AppText variant="title">{config.glyph}</AppText></LinearGradient>
            <AppText variant="label" style={styles.avatarLabel}>{t(`onboarding.avatars.${id}`)}</AppText>
          </Pressable>;
        })}</View>
        <PrimaryButton label={t('common.continue')} onPress={() => setPage(2)} />
        <PrimaryButton label={t('common.back')} variant="ghost" onPress={() => setPage(0)} />
      </View> : null}

      {page === 2 ? <View style={styles.section}>
        <AppText variant="heading">{t('onboarding.permissionTitle')}</AppText>
        <AppText color={colors.muted}>{t('onboarding.permissionBody')}</AppText>
        <View style={styles.permissionIcon}><AppText variant="display" color={colors.goldSoft}>✦</AppText></View>
        <PrimaryButton loading={requesting} label={t('onboarding.enableSteps')} onPress={() => void request()} />
        <PrimaryButton label={t('onboarding.demoMode')} variant="ghost" onPress={complete} />
      </View> : null}
    </Screen>
  );
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.choice, selected && styles.selected]}><AppText variant="label" color={selected ? colors.goldSoft : colors.ink}>{label}</AppText></Pressable>;
}

const styles = StyleSheet.create({
  art: { height: 330, marginHorizontal: -spacing.lg, overflow: 'hidden', justifyContent: 'flex-end', padding: spacing.lg },
  moon: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(239,210,143,0.16)', top: 42, right: 40 },
  peak: { position: 'absolute', width: 280, height: 280, transform: [{ rotate: '45deg' }], backgroundColor: '#102A25' },
  peakOne: { top: 160, left: -90 }, peakTwo: { top: 120, right: -120, backgroundColor: '#17342D' }, artCopy: { gap: spacing.sm, zIndex: 2 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginVertical: spacing.lg }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.stone }, dotActive: { width: 24, backgroundColor: colors.goldSoft },
  section: { gap: spacing.md }, row: { flexDirection: 'row', gap: spacing.md }, choice: { flex: 1, height: 54, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }, selected: { borderColor: colors.gold, backgroundColor: 'rgba(213,172,88,0.1)' },
  avatars: { gap: spacing.sm }, avatarChoice: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border }, avatar: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' }, avatarLabel: { flex: 1 },
  permissionIcon: { height: 110, alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});
