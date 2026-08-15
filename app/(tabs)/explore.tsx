import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { JourneyCard } from '@/components/journey/JourneyCard';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { journeys, regions } from '@/data/seed';
import type { RegionId } from '@/domain/models';
import { useGameStore } from '@/store/useGameStore';
import { colors, radius, spacing } from '@/theme/tokens';

type Filter = 'all' | RegionId;

export default function ExploreScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const progress = useGameStore((state) => state.progress);
  const filtered = filter === 'all' ? journeys : journeys.filter((journey) => journey.regionId === filter);

  return (
    <Screen>
      <View style={styles.header}><AppText variant="title">{t('explore.title')}</AppText><AppText color={colors.muted}>{t('explore.subtitle')}</AppText></View>
      <View style={styles.map}>
        <View style={[styles.land, styles.landOne]} /><View style={[styles.land, styles.landTwo]} />
        {[{ top: 42, left: 90 }, { top: 86, left: 170 }, { top: 136, left: 120 }, { top: 58, left: 235 }].map((position, index) => <View key={index} style={[styles.node, position]}><View style={styles.nodeCore} /></View>)}
        <View style={styles.mapLabel}><Feather name="navigation" color={colors.goldSoft} size={16} /><AppText variant="label">{t('explore.routes', { count: journeys.length })}</AppText></View>
      </View>

      <View style={styles.filters}>
        <FilterChip active={filter === 'all'} label={t('explore.all')} onPress={() => setFilter('all')} />
        {regions.map((region) => <FilterChip key={region.id} active={filter === region.id} label={t(region.nameKey)} onPress={() => setFilter(region.id)} />)}
      </View>

      <View style={styles.list}>{filtered.map((journey) => <JourneyCard key={journey.id} journey={journey}
        unlocked={progress.unlockedJourneyIds.includes(journey.id)} completed={progress.completedJourneyIds.includes(journey.id)}
        progress={progress.journeySteps[journey.id] ?? 0} onPress={() => router.push(`/journey/${journey.id}`)} />)}</View>
    </Screen>
  );
}

function FilterChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}><AppText variant="caption" color={active ? colors.black : colors.muted}>{label}</AppText></Pressable>;
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.md }, map: { height: 210, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  land: { position: 'absolute', width: 180, height: 260, borderRadius: 80, backgroundColor: '#294A3F', transform: [{ rotate: '-18deg' }] }, landOne: { left: 70, top: -20 }, landTwo: { width: 110, height: 180, left: 190, top: 65, backgroundColor: '#213E36' },
  node: { position: 'absolute', width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(240,211,140,0.22)', alignItems: 'center', justifyContent: 'center' }, nodeCore: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.goldSoft }, mapLabel: { position: 'absolute', left: spacing.md, bottom: spacing.md, right: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }, chip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, chipActive: { backgroundColor: colors.goldSoft, borderColor: colors.goldSoft }, list: { paddingBottom: spacing.lg },
});
