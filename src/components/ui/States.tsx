import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, spacing } from '@/theme/tokens';
import { AppText } from './AppText';
import { PrimaryButton } from './PrimaryButton';

export function LoadingState() { const { t } = useTranslation(); return <View style={styles.wrap}><ActivityIndicator color={colors.gold} size="large" /><AppText color={colors.muted}>{t('common.loading')}</AppText></View>; }
export function EmptyState() { const { t } = useTranslation(); return <View style={styles.wrap}><AppText color={colors.muted}>{t('common.noData')}</AppText></View>; }
export function ErrorState({ messageKey, onRetry }: { messageKey: string; onRetry?: () => void }) { const { t } = useTranslation(); return <View style={styles.wrap}><AppText variant="heading">{t('errors.title')}</AppText><AppText color={colors.muted} style={styles.center}>{t(messageKey)}</AppText>{onRetry ? <PrimaryButton label={t('common.retry')} onPress={onRetry} /> : null}</View>; }
const styles = StyleSheet.create({ wrap: { flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg }, center: { textAlign: 'center' } });
