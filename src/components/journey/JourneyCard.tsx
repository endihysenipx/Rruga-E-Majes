import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Journey } from '@/domain/models';
import { colors, radius, spacing } from '@/theme/tokens';

interface Props { journey: Journey; unlocked: boolean; completed: boolean; progress: number; onPress: () => void; }

export function JourneyCard({ journey, unlocked, completed, progress, onPress }: Props) {
  const { t } = useTranslation();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <LinearGradient colors={journey.colors} style={styles.art}>
        <View style={styles.mountain} />
        {!unlocked ? <View style={styles.lock}><Feather name="lock" color={colors.ink} size={18} /></View> : null}
      </LinearGradient>
      <View style={styles.body}>
        <View style={styles.titleRow}><AppText variant="heading" style={styles.flex}>{t(journey.nameKey)}</AppText>{completed ? <Feather name="check-circle" color={colors.goldSoft} size={20} /> : null}</View>
        <AppText variant="caption" color={colors.muted}>{t(`difficulty.${journey.difficulty}`)} · {journey.virtualSteps.toLocaleString()} {t('common.steps')}</AppText>
        {unlocked ? <ProgressBar compact value={progress} max={journey.virtualSteps} /> : <AppText variant="caption" color={colors.gold}>{t('common.locked')}</AppText>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({ wrap: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md }, pressed: { opacity: 0.86 }, art: { height: 104, overflow: 'hidden' }, mountain: { position: 'absolute', width: 170, height: 170, backgroundColor: 'rgba(5,20,17,0.42)', transform: [{ rotate: '45deg' }], left: 70, top: 45 }, lock: { position: 'absolute', right: spacing.md, top: spacing.md, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(8,20,18,0.68)', alignItems: 'center', justifyContent: 'center' }, body: { padding: spacing.md, gap: spacing.sm }, titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, flex: { flex: 1 } });
