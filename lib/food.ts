import { HalalItem } from '@/services/places';
import { PrayerKey } from '@/constants/theme';

export interface Mood {
  key: string;
  label: string;
  sky: PrayerKey;
  test: (f: HalalItem) => boolean;
}

export const MOODS: Mood[] = [
  { key: 'late', label: 'Late-night', sky: 'isyak', test: (f) => /murtabak|prata|briyani|biryani|supper|mamak|zam/i.test(`${f.cuisine} ${f.name}`) },
  { key: 'brunch', label: 'Brunch', sky: 'zohor', test: (f) => /cafe|café|coffee|brunch|bakery|toast/i.test(`${f.cuisine} ${f.name}`) },
  { key: 'cheap', label: 'Under $10', sky: 'asar', test: (f) => /nasi|hawker|kopitiam|noodle|mee|prata|padang|stall|food court/i.test(`${f.cuisine} ${f.name}`) },
  { key: 'date', label: 'Date night', sky: 'maghrib', test: (f) => /modern|fine|steak|grill|bistro|council|japanese|korean|italian|mediterranean/i.test(`${f.cuisine} ${f.name}`) },
];

export function moodOf(f: HalalItem): Mood | null {
  return MOODS.find((m) => m.test(f)) ?? null;
}

/** Stable pseudo-rating for items with no Google rating (4.2–4.7). */
export function ratingOf(f: HalalItem): number {
  if (f.rating) return f.rating;
  let h = 0;
  for (const ch of f.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return 4.2 + (h % 6) / 10;
}
