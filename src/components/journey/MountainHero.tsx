import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Journey } from '@/domain/models';
import { colors, radius, spacing } from '@/theme/tokens';

interface Props { journey: Journey; title: string; story: string; currentSteps: number; }

export function MountainHero({ journey, title, story, currentSteps }: Props) {
  return (
    <LinearGradient colors={journey.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={styles.sun} />
      <View style={[styles.peak, styles.peakBack]} />
      <View style={[styles.peak, styles.peakFront]} />
      <View style={styles.content}>
        <AppText variant="caption" color={colors.parchment}>{Math.round((currentSteps / journey.virtualSteps) * 100)}%</AppText>
        <AppText variant="title">{title}</AppText>
        <AppText color="rgba(255,255,255,0.78)" numberOfLines={2}>{story}</AppText>
        <ProgressBar value={currentSteps} max={journey.virtualSteps} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 300, borderRadius: radius.lg, overflow: 'hidden', justifyContent: 'flex-end', padding: spacing.lg },
  sun: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(246,211,132,0.22)', top: 30, right: 28 },
  peak: { position: 'absolute', width: 260, height: 260, backgroundColor: 'rgba(8,25,23,0.34)', transform: [{ rotate: '45deg' }] },
  peakBack: { right: -85, top: 95 }, peakFront: { left: -80, top: 130, backgroundColor: 'rgba(6,20,18,0.62)' },
  content: { gap: spacing.sm, zIndex: 2 },
});
