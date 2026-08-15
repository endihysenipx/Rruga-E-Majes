import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { visualAssets } from '@/config/assets';
import type { Journey } from '@/domain/models';
import { colors, radius, spacing } from '@/theme/tokens';

interface Props { journey: Journey; unlocked: boolean; completed: boolean; progress: number; onPress: () => void; }

export function JourneyCard({ journey, unlocked, completed, progress, onPress }: Props) {
  const { t } = useTranslation();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <ImageBackground source={visualAssets.journeyArtwork[journey.regionId]} resizeMode='cover' style={styles.art}>
        <LinearGradient colors={['rgba(5,12,10,0.08)', 'rgba(5,12,10,0.9)']} style={styles.overlay}>
          <View style={styles.topline}>
            <View style={styles.difficulty}><AppText variant='caption' color={colors.parchment}>{t(`difficulty.${journey.difficulty}`)}</AppText></View>
            {!unlocked ? <View style={styles.lock}><Feather name='lock' color={colors.ink} size={17} /></View> : completed ? <View style={styles.complete}><Feather name='check' color={colors.black} size={16} /></View> : null}
          </View>
          <View style={styles.copy}><AppText variant='heading'>{t(journey.nameKey)}</AppText><AppText variant='caption' color='rgba(247,240,222,0.72)' numberOfLines={2}>{t(journey.storyKey)}</AppText></View>
        </LinearGradient>
      </ImageBackground>
      <View style={styles.body}>
        <View style={styles.meta}><AppText variant='caption' color={colors.muted}>{journey.virtualSteps.toLocaleString()} {t('common.steps')}</AppText><AppText variant='caption' color={colors.goldSoft}>{unlocked ? `${Math.round((progress / journey.virtualSteps) * 100)}%` : t('common.locked')}</AppText></View>
        {unlocked ? <ProgressBar compact value={progress} max={journey.virtualSteps} /> : <View style={styles.lockedLine} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md }, pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  art: { height: 190 }, overlay: { flex: 1, justifyContent: 'space-between', padding: spacing.md }, topline: { flexDirection: 'row', justifyContent: 'space-between' },
  difficulty: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: 'rgba(5,14,11,0.66)', borderWidth: 1, borderColor: colors.border },
  lock: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(5,14,11,0.72)', alignItems: 'center', justifyContent: 'center' }, complete: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  copy: { gap: spacing.xs }, body: { padding: spacing.md, gap: spacing.sm }, meta: { flexDirection: 'row', justifyContent: 'space-between' }, lockedLine: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)' },
});
