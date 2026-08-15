import { StyleSheet, View } from 'react-native';

import { progressPercent } from '@/domain/gameLogic';
import { colors, radius } from '@/theme/tokens';

export function ProgressBar({ value, max, compact = false }: { value: number; max: number; compact?: boolean }) {
  return <View style={[styles.track, compact && styles.compact]}><View style={[styles.fill, { width: `${progressPercent(value, max)}%` }]} /></View>;
}

const styles = StyleSheet.create({ track: { height: 10, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }, compact: { height: 6 }, fill: { height: '100%', backgroundColor: colors.goldSoft, borderRadius: radius.pill } });
