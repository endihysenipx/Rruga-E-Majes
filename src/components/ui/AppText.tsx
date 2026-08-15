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
  display: { fontFamily: 'serif', fontSize: 38, lineHeight: 43, fontWeight: '700', letterSpacing: -0.8 },
  title: { fontFamily: 'serif', fontSize: 29, lineHeight: 35, fontWeight: '700', letterSpacing: -0.4 },
  heading: { fontFamily: 'serif', fontSize: 21, lineHeight: 27, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22 }, label: { fontSize: 13, lineHeight: 18, fontWeight: '700', letterSpacing: 0.3 },
  caption: { fontSize: 12, lineHeight: 17 }, stat: { fontSize: 24, lineHeight: 29, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
