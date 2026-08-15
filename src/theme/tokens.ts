export const colors = {
  ink: '#F7F0DE', muted: '#AAAFA1', canvas: '#071411', surface: '#10231E', surfaceRaised: '#183029',
  surfaceGlass: 'rgba(10, 28, 23, 0.84)', emerald: '#1D5A48', emeraldLight: '#5B9B7D', gold: '#C99A42',
  goldSoft: '#F1D28A', parchment: '#EAD8B5', parchmentInk: '#2A241C', copper: '#A86845', ember: '#E88D4D',
  fog: '#92A7A0', stone: '#697A73', danger: '#D37863', white: '#FFFFFF', black: '#050C0A', border: 'rgba(241,210,138,0.18)',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { sm: 10, md: 18, lg: 28, xl: 36, pill: 999 } as const;
export const shadows = { card: { shadowColor: '#000', shadowOpacity: 0.32, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 7 } } as const;
