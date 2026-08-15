import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { visualAssets } from '@/config/assets';
import { progressPercent } from '@/domain/gameLogic';
import type { Journey } from '@/domain/models';
import { colors, radius, spacing } from '@/theme/tokens';

interface Props { journey: Journey; title: string; story: string; currentSteps: number; regionLabel?: string; }

export function MountainHero({ journey, title, story, currentSteps, regionLabel }: Props) {
  const percent = Math.round(progressPercent(currentSteps, journey.virtualSteps));
  return (
    <ImageBackground source={visualAssets.journeyArtwork[journey.regionId]} resizeMode='cover' imageStyle={styles.image} style={styles.hero}>
      <LinearGradient colors={['rgba(5,12,10,0.04)', 'rgba(5,14,11,0.25)', 'rgba(5,14,11,0.96)']} locations={[0, 0.48, 1]} style={styles.overlay}>
        <View style={styles.topline}>
          <View style={styles.realmBadge}><Feather name='compass' color={colors.goldSoft} size={13} /><AppText variant='caption' color={colors.goldSoft}>{regionLabel}</AppText></View>
          <View style={styles.percentBadge}><AppText variant='label' color={colors.parchment}>{percent}%</AppText></View>
        </View>
        <View style={styles.content}>
          <AppText variant='display'>{title}</AppText>
          <AppText color='rgba(247,240,222,0.78)' numberOfLines={2}>{story}</AppText>
          <View style={styles.trail}>
            {journey.checkpoints.map((checkpoint, index) => {
              const reached = currentSteps >= checkpoint.atSteps;
              return <View key={checkpoint.id} style={styles.trailPart}>
                <View style={[styles.trailNode, reached && styles.trailNodeReached]}>{reached ? <Feather name='check' size={11} color={colors.black} /> : <View style={styles.trailNodeCore} />}</View>
                {index < journey.checkpoints.length - 1 ? <View style={[styles.trailLine, currentSteps >= journey.checkpoints[index + 1]!.atSteps && styles.trailLineReached]} /> : null}
              </View>;
            })}
            <View style={styles.summit}><Feather name='flag' color={percent >= 100 ? colors.goldSoft : colors.muted} size={16} /></View>
          </View>
          <ProgressBar value={currentSteps} max={journey.virtualSteps} compact />
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: { height: 440, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  image: { borderRadius: radius.xl }, overlay: { flex: 1, justifyContent: 'space-between', padding: spacing.lg },
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  realmBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(5,14,11,0.68)', borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill },
  percentBadge: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(5,14,11,0.72)', borderWidth: 1, borderColor: colors.border },
  content: { gap: spacing.sm }, trail: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  trailPart: { flexDirection: 'row', alignItems: 'center', flex: 1 }, trailNode: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(241,210,138,0.35)', backgroundColor: 'rgba(5,14,11,0.8)', alignItems: 'center', justifyContent: 'center' },
  trailNodeReached: { backgroundColor: colors.goldSoft, borderColor: colors.goldSoft }, trailNodeCore: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.muted },
  trailLine: { height: 1, flex: 1, backgroundColor: 'rgba(241,210,138,0.2)' }, trailLineReached: { backgroundColor: colors.goldSoft }, summit: { width: 24, alignItems: 'flex-end' },
});
