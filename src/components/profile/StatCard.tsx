import { StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { colors, spacing } from '@/theme/tokens';

export function StatCard({ value, label }: { value: string; label: string }) {
  return <Card style={styles.card}><AppText variant="stat" color={colors.goldSoft}>{value}</AppText><AppText variant="caption" color={colors.muted}>{label}</AppText></Card>;
}
const styles = StyleSheet.create({ card: { flex: 1, minWidth: 140, gap: spacing.xs }, row: { flexDirection: 'row' }, hidden: { display: 'none' } });
