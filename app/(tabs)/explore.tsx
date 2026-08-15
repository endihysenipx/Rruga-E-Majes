import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { JourneyCard } from '@/components/journey/JourneyCard';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { visualAssets } from '@/config/assets';
import { journeys, regions } from '@/data/seed';
import type { RegionId } from '@/domain/models';
import { useGameStore } from '@/store/useGameStore';
import { colors, radius, spacing } from '@/theme/tokens';

type Filter = 'all' | RegionId;
const mapPins = [
  { journeyId: 'gjeravica', top: '18%', left: '53%' }, { journeyId: 'rugova', top: '28%', left: '39%' },
  { journeyId: 'theth', top: '44%', left: '34%' }, { journeyId: 'korabi', top: '51%', left: '61%' },
  { journeyId: 'tomorr', top: '67%', left: '54%' }, { journeyId: 'llogara', top: '76%', left: '34%' },
] as const;

export default function ExploreScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const progress = useGameStore((state) => state.progress);
  const filtered = filter === 'all' ? journeys : journeys.filter((journey) => journey.regionId === filter);

  return (
    <Screen>
      <View style={styles.header}><View style={styles.eyebrow}><Feather name='compass' size={14} color={colors.goldSoft} /><AppText variant='caption' color={colors.goldSoft}>{t('explore.atlas').toLocaleUpperCase()}</AppText></View><AppText variant='title'>{t('explore.title')}</AppText><AppText color={colors.muted}>{t('explore.subtitle')}</AppText></View>

      <ImageBackground source={visualAssets.map} resizeMode='cover' style={styles.map} imageStyle={styles.mapImage}>
        <LinearGradient colors={['rgba(5,12,10,0.06)', 'rgba(5,12,10,0.16)', 'rgba(5,12,10,0.86)']} style={styles.mapOverlay}>
          {mapPins.map((pin) => {
            const journey = journeys.find((item) => item.id === pin.journeyId)!;
            const unlocked = progress.unlockedJourneyIds.includes(journey.id);
            return <Pressable key={pin.journeyId} onPress={() => router.push(`/journey/${journey.id}`)} style={[styles.pin, { top: pin.top, left: pin.left }]}>
              <View style={[styles.pinHalo, unlocked && styles.pinHaloActive]}><Feather name={unlocked ? 'navigation' : 'lock'} size={13} color={unlocked ? colors.black : colors.muted} /></View>
            </Pressable>;
          })}
          <View style={styles.mapFooter}><View><AppText variant='caption' color={colors.muted}>{t('explore.discovered')}</AppText><AppText variant='heading'>{progress.unlockedJourneyIds.length} / {journeys.length}</AppText></View><View style={styles.mapSeal}><Feather name='map' color={colors.goldSoft} size={22} /></View></View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.filters}>
        <FilterChip active={filter === 'all'} label={t('explore.all')} onPress={() => setFilter('all')} />
        {regions.map((region) => <FilterChip key={region.id} active={filter === region.id} label={t(region.nameKey)} onPress={() => setFilter(region.id)} />)}
      </View>

      <View style={styles.listHeader}><View><AppText variant='heading'>{filter === 'all' ? t('explore.allJourneys') : t(`regions.${filter}`)}</AppText><AppText variant='caption' color={colors.muted}>{t('explore.routes', { count: filtered.length })}</AppText></View><Feather name='wind' color={colors.gold} size={20} /></View>
      <View>{filtered.map((journey) => <JourneyCard key={journey.id} journey={journey}
        unlocked={progress.unlockedJourneyIds.includes(journey.id)} completed={progress.completedJourneyIds.includes(journey.id)}
        progress={progress.journeySteps[journey.id] ?? 0} onPress={() => router.push(`/journey/${journey.id}`)} />)}</View>
    </Screen>
  );
}

function FilterChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}><AppText variant='caption' color={active ? colors.black : colors.muted}>{label}</AppText></Pressable>;
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.lg }, eyebrow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  map: { height: 430, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg }, mapImage: { borderRadius: radius.xl }, mapOverlay: { flex: 1, padding: spacing.lg, justifyContent: 'flex-end' },
  pin: { position: 'absolute' }, pinHalo: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(7,20,17,0.88)', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, pinHaloActive: { backgroundColor: colors.goldSoft, shadowColor: colors.gold, shadowOpacity: 0.55, shadowRadius: 12, elevation: 6 },
  mapFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, mapSeal: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(7,20,17,0.76)', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl }, chip: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, chipActive: { backgroundColor: colors.goldSoft, borderColor: colors.goldSoft },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
});
