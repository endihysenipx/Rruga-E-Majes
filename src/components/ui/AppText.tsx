import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors } from '@/theme/tokens';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption' | 'stat';

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
}

export function AppText({ children, variant = 'body', color, style, ...props }: PropsWithChildren<Props>) {
  return <Text {...props} style={[styles.base, styles[variant], color ? { color } : undefined, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  base: { color: colors.ink },
  display: { fontFamily: 'serif', fontSize: 42, lineHeight: 46, fontWeight: '700', letterSpacing: -1.1 },
  title: { fontFamily: 'serif', fontSize: 31, lineHeight: 37, fontWeight: '700', letterSpacing: -0.6 },
  heading: { fontFamily: 'serif', fontSize: 21, lineHeight: 27, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22 }, label: { fontSize: 13, lineHeight: 18, fontWeight: '700', letterSpacing: 0.3 },
  caption: { fontSize: 12, lineHeight: 17 }, stat: { fontSize: 26, lineHeight: 31, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
