// HalalHabits — Unified UI design system, green brand override.
// Dark near-black headers with colored radial glows over a light #FAFAFA
// content area of white soft-UI cards. Plus Jakarta Sans throughout (no serif).

export const Colors = {
  // Brand — green
  brand: '#0B7A4F', // deep jade: active states, primary fills, prayer time, badges
  brandBright: '#25D092', // mint: glows, next bar, status dots, gradient end
  brandDeep: '#0B4C35', // gradient start (hero)
  brandTint: '#E2F7EF', // active nav bg, next-prayer card bg, badges
  brandOnDark: '#5FE0AE', // eyebrow + progress abbr on dark headers

  // Secondary accents (NOT red)
  purple: '#921FFF',
  purpleTint: '#F2E8FF',
  blue: '#5050FA',
  blueTint: '#E9E9FF',
  blueOnDark: '#7A8DFF', // masjid eyebrow on dark
  orange: '#FF6C0A',
  orangeTint: '#FFE9D9',
  gold: '#FCAE30',
  goldText: '#9A6206', // jemaah times, star ratings
  goldEyebrow: '#FFBF57', // halal eyebrow + moon star

  // Neutrals & surfaces
  bg: '#FAFAFA', // page background
  card: '#FFFFFF', // card surface
  headerDark: '#12151A', // dark header surface
  mapSurface: '#1B2230',
  mapGradFrom: '#20303A',
  mapGradTo: '#1A2A33',
  heading: '#242A33', // heading text
  body: '#323B47', // body / strong
  muted: '#5B6E88', // muted text
  dim: '#9AA7B8', // dim / placeholder
  border: '#E9EFF7', // hairline border
  borderStrong: '#C1D0E5', // stronger border / star glyph
  subtleFill: '#F5F7F9', // chevron btn, input bg
  pillTrack: '#F1F1F1', // pill toggle track
  halalTile: '#FEF1DC', // halal emoji tile bg

  white: '#FFFFFF',
} as const;

// Brand gradients (135deg). Use with expo-linear-gradient: start {0,0} end {1,1}.
export const Gradients = {
  hero: ['#0B4C35', '#0B7A4F', '#25D092'] as const, // next-prayer card
  heroLocations: [0, 0.48, 1] as const,
  brand: ['#0B7A4F', '#25D092'] as const, // avatar / user bubble / send / sunnah accents
  scanner: ['#25D092', '#0B7A4F'] as const, // halal scanner CTA
  map: ['#20303A', '#1A2A33'] as const,
} as const;

// Plus Jakarta Sans — loaded in app/_layout.tsx.
export const Fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold', // display numerals, titles
} as const;

export const Radius = {
  sm: 10,
  btn: 12,
  input: 14,
  navIcon: 14,
  tile: 16,
  card: 18,
  map: 20,
  hero: 24,
  pill: 999,
} as const;

// Warm-neutral soft shadows. RN uses shadow* (iOS) + elevation (Android).
export const Shadow = {
  // --shadow-sm
  card: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  // --shadow-xsm
  cardSubtle: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  // green glow — next-prayer card / send / scanner / active nav
  greenGlow: {
    shadowColor: '#0B7A4F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
  },
  greenGlowSoft: {
    shadowColor: '#0B7A4F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 5,
  },
} as const;
