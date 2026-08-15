import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme/tokens';
import { AppText } from './AppText';

interface Props { label: string; onPress: () => void; disabled?: boolean; loading?: boolean; variant?: 'gold' | 'ghost'; style?: ViewStyle; }

export function PrimaryButton({ label, onPress, disabled, loading, variant = 'gold', style }: Props) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled || loading} onPress={onPress}
      style={({ pressed }) => [styles.base, variant === 'ghost' ? styles.ghost : styles.gold, (disabled || loading) && styles.disabled, pressed && styles.pressed, style]}>
      {loading ? <ActivityIndicator color={variant === 'gold' ? colors.black : colors.goldSoft} /> : <AppText variant="label" color={variant === 'gold' ? colors.black : colors.goldSoft}>{label}</AppText>}
    </Pressable>
  );
}

const styles = StyleSheet.create({ base: { minHeight: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg }, gold: { backgroundColor: colors.goldSoft, shadowColor: colors.gold, shadowOpacity: 0.24, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4 }, ghost: { borderWidth: 1, borderColor: colors.gold, backgroundColor: 'rgba(8,20,17,0.3)' }, disabled: { opacity: 0.45 }, pressed: { transform: [{ scale: 0.985 }], opacity: 0.9 } });
