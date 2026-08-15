import type { ImageSourcePropType } from 'react-native';

import type { RegionId } from '@/domain/models';

const gjeravica = require('../../assets/illustrations/gjeravica-dawn.png') as ImageSourcePropType;
const albanianAlps = require('../../assets/illustrations/albanian-alps.png') as ImageSourcePropType;
const balkanNight = require('../../assets/illustrations/balkan-night.png') as ImageSourcePropType;

export const visualAssets = {
  map: require('../../assets/illustrations/balkan-map.png') as ImageSourcePropType,
  journeyArtwork: {
    kosovo: gjeravica,
    albania: albanianAlps,
    balkans: balkanNight,
  } satisfies Record<RegionId, ImageSourcePropType>,
  onboarding: gjeravica,
  motif: 'geometric-border',
  avatars: {
    arin: { glyph: '▲', colors: ['#D4A64C', '#315B4E'] as const, role: 'pathfinder' },
    bora: { glyph: '✦', colors: ['#D28A62', '#463B58'] as const, role: 'storykeeper' },
    drini: { glyph: '◆', colors: ['#7CA493', '#263D4C'] as const, role: 'ranger' },
  },
} as const;
