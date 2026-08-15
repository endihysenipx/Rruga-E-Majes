import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { colors, spacing } from '@/theme/tokens';

export function StatCard({ value, label }: { value: string; label: string }) {
  return <Card tone='glass' style={styles.card}><View style={styles.notch} /><AppText variant='stat' color={colors.goldSoft}>{value}</AppText><AppText variant='caption' color={colors.muted}>{label}</AppText></Card>;
}

const styles = StyleSheet.create({ card: { flex: 1, minWidth: 140, gap: spacing.xs, overflow: 'hidden' }, notch: { position: 'absolute', right: -18, top: -18, width: 55, height: 55, borderRadius: 28, backgroundColor: 'rgba(201,154,66,0.08)' } });
