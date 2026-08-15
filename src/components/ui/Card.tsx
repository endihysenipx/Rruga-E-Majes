import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius, shadows, spacing } from '@/theme/tokens';

interface Props extends ViewProps { tone?: 'default' | 'glass' | 'parchment'; }

export function Card({ children, style, tone = 'default', ...props }: PropsWithChildren<Props>) {
  return <View {...props} style={[styles.card, tone === 'glass' && styles.glass, tone === 'parchment' && styles.parchment, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, ...shadows.card },
  glass: { backgroundColor: colors.surfaceGlass },
  parchment: { backgroundColor: colors.parchment, borderColor: 'rgba(42,36,28,0.2)' },
});
