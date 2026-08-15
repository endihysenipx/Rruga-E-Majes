import type { Achievement, Journey, Quest, Region } from '@/domain/models';

export const regions: Region[] = [
  { id: 'kosovo', nameKey: 'regions.kosovo', descriptionKey: 'regions.kosovoDescription', accent: '#D3A84B' },
  { id: 'albania', nameKey: 'regions.albania', descriptionKey: 'regions.albaniaDescription', accent: '#B85A48' },
  { id: 'balkans', nameKey: 'regions.balkans', descriptionKey: 'regions.balkansDescription', accent: '#6F84A7' },
];

const route = (
  id: string,
  regionId: Journey['regionId'],
  steps: number,
  difficulty: Journey['difficulty'],
  colors: Journey['colors'],
  unlockAfter?: string,
): Journey => ({
  id,
  regionId,
  nameKey: `journeys.${id}.name`,
  storyKey: `journeys.${id}.story`,
  difficulty,
  virtualSteps: steps,
  unlockAfter,
  colors,
  rewards: [{ kind: 'xp', amount: Math.round(steps / 20) }, { kind: 'coins', amount: Math.round(steps / 100) }],
  checkpoints: [0.3, 0.65, 1].map((ratio, index) => ({
    id: `${id}-checkpoint-${index + 1}`,
    nameKey: `checkpoints.${index + 1}.name`,
    storyKey: `checkpoints.${index + 1}.story`,
    atSteps: Math.round(steps * ratio),
    reward: index === 2 ? { kind: 'story', itemId: `${id}-legend` } : { kind: 'coins', amount: 20 + index * 15 },
  })),
});

export const journeys: Journey[] = [
  route('gjeravica', 'kosovo', 12_000, 'moderate', ['#173F36', '#5A8D73', '#D5A550']),
  route('rugova', 'kosovo', 16_000, 'moderate', ['#183C45', '#507B79', '#CE884A'], 'gjeravica'),
  route('hajla', 'kosovo', 20_000, 'challenging', ['#202F3E', '#647A84', '#C7A56A'], 'rugova'),
  route('bjeshket', 'kosovo', 24_000, 'challenging', ['#142E2B', '#476E5C', '#D1B26A'], 'hajla'),
  route('sharri', 'kosovo', 18_000, 'moderate', ['#2A3C51', '#6D7C9A', '#D1A45D'], 'rugova'),
  route('luboteni', 'kosovo', 26_000, 'challenging', ['#272D3B', '#777E8F', '#D59B55'], 'sharri'),
  route('theth', 'albania', 14_000, 'moderate', ['#143D42', '#468482', '#D8A35A'], 'gjeravica'),
  route('valbona', 'albania', 19_000, 'moderate', ['#17353F', '#4D7A8E', '#D29B57'], 'theth'),
  route('korabi', 'albania', 28_000, 'challenging', ['#2D3442', '#7E8795', '#D1A95A'], 'valbona'),
  route('dajti', 'albania', 10_000, 'easy', ['#25452E', '#65865A', '#D3AA55'], 'theth'),
  route('tomorr', 'albania', 21_000, 'challenging', ['#493B34', '#8C6B54', '#D7AE69'], 'dajti'),
  route('llogara', 'albania', 17_000, 'moderate', ['#163C49', '#3E8591', '#E2B66D'], 'dajti'),
  route('durmitor', 'balkans', 32_000, 'challenging', ['#283645', '#6B8290', '#D0B16F'], 'korabi'),
  route('triglav', 'balkans', 36_000, 'challenging', ['#24313D', '#788B94', '#CBAA63'], 'durmitor'),
];

export const quests: Quest[] = [
  ['walk3000', 'daily', 'dailySteps', 3_000, 60],
  ['dailyGoal', 'daily', 'dailyGoal', 1, 100],
  ['walk5000', 'daily', 'dailySteps', 5_000, 90],
  ['checkpoint', 'daily', 'checkpoint', 1, 80],
  ['threeDays', 'weekly', 'activeDays', 3, 180],
  ['fiveDays', 'weekly', 'activeDays', 5, 280],
  ['weekly20000', 'weekly', 'totalSteps', 20_000, 300],
  ['weekly40000', 'weekly', 'totalSteps', 40_000, 550],
].map(([id, cadence, metric, target, xp]) => ({
  id: String(id),
  titleKey: `quests.${id}.title`,
  descriptionKey: `quests.${id}.description`,
  cadence: cadence as Quest['cadence'],
  metric: metric as Quest['metric'],
  target: Number(target),
  reward: { kind: 'xp', amount: Number(xp) },
}));

export const achievements: Achievement[] = [
  ['first1000', 'totalSteps', 1_000], ['firstRoute', 'completedRoutes', 1],
  ['tenKm', 'distanceKm', 10], ['hundredKm', 'distanceKm', 100],
  ['sevenDay', 'streak', 7], ['kosovoExplorer', 'regionRoutes', 6, 'kosovo'],
  ['albaniaExplorer', 'regionRoutes', 6, 'albania'], ['mountainLegend', 'completedRoutes', 12],
  ['fiftyThousand', 'totalSteps', 50_000], ['quarterMillion', 'totalSteps', 250_000],
].map(([id, metric, target, regionId]) => ({
  id: String(id), titleKey: `achievements.${id}.title`, descriptionKey: `achievements.${id}.description`,
  metric: metric as Achievement['metric'], target: Number(target), regionId: regionId as Achievement['regionId'],
  reward: { kind: 'badge', itemId: String(id) },
}));
