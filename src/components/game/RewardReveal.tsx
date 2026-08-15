import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import type { RewardMoment } from '@/domain/models';
import { colors, radius, spacing } from '@/theme/tokens';

const icons: Record<RewardMoment['kind'], keyof typeof Feather.glyphMap> = {
  walk: 'navigation', checkpoint: 'map-pin', route: 'flag', quest: 'star', achievement: 'award',
};

export function RewardReveal({ reward, onClose }: { reward?: RewardMoment; onClose: () => void }) {
  const { t } = useTranslation();
  if (!reward) return null;
  return (
    <Modal visible transparent animationType='fade' onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <LinearGradient colors={['#1C3B31', '#0B1B17']} style={styles.sheet}>
          <View style={styles.rays}><View style={styles.ring}><View style={styles.icon}><Feather name={icons[reward.kind]} size={30} color={colors.black} /></View></View></View>
          <AppText variant='caption' color={colors.goldSoft} style={styles.eyebrow}>{t(`rewards.kinds.${reward.kind}`).toLocaleUpperCase()}</AppText>
          <AppText variant='title' style={styles.center}>{t(reward.titleKey)}</AppText>
          {reward.storyKey ? <AppText color={colors.muted} style={styles.center}>{t(reward.storyKey)}</AppText> : null}
          <View style={styles.rewards}>
            {reward.xp > 0 ? <RewardPill icon='zap' value={`+${reward.xp} ${t('common.xp')}`} /> : null}
            {reward.coins > 0 ? <RewardPill icon='hexagon' value={`+${reward.coins} ${t('common.coins')}`} /> : null}
          </View>
          {reward.collectibleNameKey ? <View style={styles.collectible}><Feather name='book-open' color={colors.goldSoft} size={18} /><View><AppText variant='caption' color={colors.muted}>{t('rewards.newCollectible')}</AppText><AppText variant='label'>{t(reward.collectibleNameKey)}</AppText></View></View> : null}
          <PrimaryButton label={t('rewards.keepWalking')} onPress={onClose} />
        </LinearGradient>
      </View>
    </Modal>
  );
}

function RewardPill({ icon, value }: { icon: keyof typeof Feather.glyphMap; value: string }) {
  return <View style={styles.pill}><Feather name={icon} color={colors.goldSoft} size={15} /><AppText variant='label' color={colors.goldSoft}>{value}</AppText></View>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(2,8,6,0.82)', padding: spacing.lg },
  sheet: { width: '100%', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, gap: spacing.md, overflow: 'hidden' },
  rays: { alignItems: 'center', marginBottom: spacing.sm }, ring: { width: 104, height: 104, borderRadius: 52, borderWidth: 1, borderColor: 'rgba(241,210,138,0.35)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(241,210,138,0.06)' },
  icon: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { textAlign: 'center', letterSpacing: 1.8 }, center: { textAlign: 'center' }, rewards: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: spacing.sm },
  pill: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: 'rgba(241,210,138,0.1)', borderWidth: 1, borderColor: colors.border },
  collectible: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: 'rgba(5,14,11,0.45)' },
});
