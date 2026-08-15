import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme/tokens';

interface Props { scroll?: boolean; header?: ReactNode; }

export function Screen({ children, scroll = true, header }: PropsWithChildren<Props>) {
  const content = <View style={styles.content}>{header}{children}</View>;
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View pointerEvents='none' style={[styles.glow, styles.glowTop]} />
      <View pointerEvents='none' style={[styles.glow, styles.glowBottom]} />
      {scroll ? <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas }, scroll: { flexGrow: 1 }, content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: 120 },
  glow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(37,92,72,0.12)' },
  glowTop: { top: -140, right: -100 }, glowBottom: { bottom: 20, left: -170, backgroundColor: 'rgba(201,154,66,0.05)' },
});
