export const colors = {
  ink: '#F5EFDF', muted: '#B8B8A9', canvas: '#0D1D1A', surface: '#142824', surfaceRaised: '#1A332D',
  emerald: '#1F5648', emeraldLight: '#4D8A73', gold: '#D5AC58', goldSoft: '#F0D38C', parchment: '#EFE2C5',
  stone: '#76827B', danger: '#D17A65', white: '#FFFFFF', black: '#07100E', border: 'rgba(240,211,140,0.16)',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { sm: 10, md: 18, lg: 28, pill: 999 } as const;
export const shadows = { card: { shadowColor: '#000', shadowOpacity: 0.24, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 5 } } as const;
