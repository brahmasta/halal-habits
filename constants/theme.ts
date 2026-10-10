// Halal Habit v2 — "the app follows the sky".
// Base tokens (Chalk = light, Ink = dark) + the five-prayer sky palette.

export type PrayerKey = 'subuh' | 'zohor' | 'asar' | 'maghrib' | 'isyak';

export interface Sky {
  k: PrayerKey;
  name: string;
  ar: string;
  vibe: string;
  bg: string;
  ink: string;
  sub: string;
  dim: string;
  /** true when the ink is light (card is dark) */
  onDark: boolean;
}

export const SKY: Record<PrayerKey, Sky> = {
  subuh: { k: 'subuh', name: 'Subuh', ar: 'الفجر', vibe: 'Dawn', bg: '#2B305C', ink: '#F2EFE8', sub: '#F3B89C', dim: 'rgba(242,239,232,0.62)', onDark: true },
  zohor: { k: 'zohor', name: 'Zohor', ar: 'الظهر', vibe: 'Midday', bg: '#EDD68A', ink: '#1A1913', sub: '#6E5310', dim: 'rgba(26,25,19,0.6)', onDark: false },
  asar: { k: 'asar', name: 'Asar', ar: 'العصر', vibe: 'Afternoon', bg: '#E5A070', ink: '#1E140E', sub: '#66361A', dim: 'rgba(30,20,14,0.6)', onDark: false },
  maghrib: { k: 'maghrib', name: 'Maghrib', ar: 'المغرب', vibe: 'Sunset', bg: '#B6503F', ink: '#FCEEE7', sub: '#FFD3BA', dim: 'rgba(252,238,231,0.66)', onDark: true },
  isyak: { k: 'isyak', name: 'Isyak', ar: 'العشاء', vibe: 'Night', bg: '#161A2E', ink: '#ECE9F5', sub: '#AEB7EC', dim: 'rgba(236,233,245,0.6)', onDark: true },
};

export const SKY_ORDER: PrayerKey[] = ['subuh', 'zohor', 'asar', 'maghrib', 'isyak'];

export interface Tokens {
  dark: boolean;
  bg: string;
  surface: string;
  sunk: string;
  ink: string;
  muted: string;
  faint: string;
  line: string;
  brand: string;
  brandInk: string;
  brandSoft: string;
  shell: string;
  ring: string;
  shadow: string;
  hi: string;
  glass: string;
}

export const CHALK: Tokens = {
  dark: false,
  bg: '#FAFAF7',
  surface: '#FFFFFF',
  sunk: '#EFEFEA',
  ink: '#121412',
  muted: '#5C5F59',
  faint: '#A3A59E',
  line: 'rgba(18,20,18,0.08)',
  brand: '#24402F',
  brandInk: '#F3F1EC',
  brandSoft: '#DCE5DC',
  shell: 'rgba(18,20,18,0.035)',
  ring: 'rgba(18,20,18,0.07)',
  shadow: 'rgba(28,40,30,0.16)',
  hi: 'rgba(255,255,255,0.8)',
  glass: 'rgba(252,251,248,0.78)',
};

export const INK: Tokens = {
  dark: true,
  bg: '#111311',
  surface: '#1B1E1B',
  sunk: '#232723',
  ink: '#F1EFEA',
  muted: '#A4A79F',
  faint: '#5E625C',
  line: 'rgba(255,255,255,0.08)',
  brand: '#7FB08E',
  brandInk: '#0E1A12',
  brandSoft: 'rgba(127,176,142,0.16)',
  shell: 'rgba(255,255,255,0.04)',
  ring: 'rgba(255,255,255,0.08)',
  shadow: 'rgba(0,0,0,0.6)',
  hi: 'rgba(255,255,255,0.06)',
  glass: 'rgba(27,30,27,0.78)',
};

/** Always-dark welcome screen surface. */
export const WELCOME_BG = '#121412';
export const WELCOME_INK = '#F3F1EC';

// Fonts — loaded in app/_layout.tsx.
export const Fonts = {
  display: 'BricolageGrotesque_600SemiBold',
  displayMedium: 'BricolageGrotesque_500Medium',
  displayRegular: 'BricolageGrotesque_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
  body: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
  mono: 'GeistMono_400Regular',
  monoMedium: 'GeistMono_500Medium',
  arabic: 'Amiri_400Regular',
} as const;

export const EASE = { x1: 0.32, y1: 0.72, x2: 0, y2: 1 } as const;

/** Double-bezel shadow stack (one boxShadow string, no borders). */
export function bezelShadow(t: Tokens, coloured: boolean, tint: string = t.shadow): string {
  const hi = coloured ? 'rgba(255,255,255,0.18)' : t.hi;
  return `inset 0 1px 0 ${hi}, 0 0 0 6px ${t.shell}, 0 0 0 7px ${t.ring}, 0 26px 44px -26px ${tint}`;
}

export function ringShadow(t: Tokens): string {
  return `0 0 0 1px ${t.ring}`;
}

export function roundShadow(t: Tokens): string {
  return `inset 0 1px 0 ${t.hi}, 0 0 0 1px ${t.ring}, 0 10px 22px -12px ${t.shadow}`;
}

export const PRIMARY_BTN_SHADOW = 'inset 0 1px 0 rgba(255,255,255,0.12), 0 16px 30px -16px rgba(18,20,18,0.55)';
