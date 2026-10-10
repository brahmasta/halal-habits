// Live mosque + halal-food data, sourced from the same backend/database as the
// guided-salah web app (https://halalhabits.app). The app calls those public
// read endpoints so both products show the same listings.
//
// Note: works directly on native. On web it needs CORS enabled on the API
// (guided-salah PR #6) since the request is cross-origin.

import { SEED_PLACES } from '../lib/places-seed';
import { SEED_FOOD } from '../lib/food-seed';

// Places data comes from the app's own Supabase edge function (supabase/functions/places).
const FN_BASE = `${process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://bekvxwarareoxulpswsm.supabase.co'}/functions/v1`;
const placesUrl = (kind: 'mosques' | 'food', loc: { lat: number; lng: number }) =>
  `${FN_BASE}/places?kind=${kind}&lat=${loc.lat.toFixed(5)}&lng=${loc.lng.toFixed(5)}`;

// Default reference point (Singapore CBD / Kampong Glam) used for distances and
// the "nearby food" query, until device geolocation is wired up.
export const SG_CENTER = { lat: 1.3021, lng: 103.8567 };

type LatLng = { lat: number; lng: number };

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const round1 = (n: number) => Math.round(n * 10) / 10;

/** fetch with a hard timeout so a cold backend never leaves screens hanging. */
async function fetchT(url: string, ms = 9000): Promise<Response> {
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(url, { signal: ctl.signal });
  } finally {
    clearTimeout(id);
  }
}

function pickFoodEmoji(text: string): string {
  const t = text.toLowerCase();
  if (/nasi|malay|padang/.test(t)) return '🍛';
  if (/biryani|briyani|indian/.test(t)) return '🍚';
  if (/noodle|\bmee\b|ramen|prawn noodle/.test(t)) return '🍜';
  if (/cafe|café|coffee|brunch/.test(t)) return '☕';
  if (/bbq|grill|barbe|steak/.test(t)) return '🥩';
  if (/burger|western/.test(t)) return '🍔';
  if (/chicken|ayam|fried/.test(t)) return '🍗';
  if (/seafood|fish|prawn|crab/.test(t)) return '🦐';
  if (/middle|arab|kebab|shawarma|persian|turkish|lebanese/.test(t)) return '🥙';
  if (/dessert|cake|sweet|ice/.test(t)) return '🍰';
  if (/bread|murtabak|prata|roti|naan/.test(t)) return '🫓';
  return '🍽️';
}

function prettyTypes(types?: string[]): string {
  if (!Array.isArray(types)) return '';
  const words = types
    .filter((t) => /_restaurant$/.test(t) && t !== 'restaurant')
    .map((t) => t.replace(/_restaurant$/, ''))
    .filter((t) => t && t !== 'meal' && t !== 'fast_food')
    .map((t) =>
      t
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    );
  return [...new Set(words)].slice(0, 2).join(' · ');
}

// ── Mosques / prayer rooms ───────────────────────────────────────────────────
export interface Mosque {
  id: string;
  name: string;
  type: 'Masjid' | 'Musholla';
  area: string;
  address: string;
  distanceKm: number;
  jemaahTime?: string;
  emoji: string;
  coordinates: LatLng;
  openUntil?: string;
  women?: boolean;
  steps?: Array<[string, string]>;
}

export function seedMosques(loc: LatLng = SG_CENTER): Mosque[] {
  return SEED_PLACES.map<Mosque>((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    area: r.area,
    address: r.address,
    distanceKm: round1(haversineKm(loc, { lat: r.lat, lng: r.lng })),
    jemaahTime: r.jemaahTime,
    emoji: r.type === 'Musholla' ? '🏪' : '🕌',
    coordinates: { lat: r.lat, lng: r.lng },
    openUntil: r.openUntil,
    women: r.women,
    steps: r.steps,
  })).sort((a, b) => a.distanceKm - b.distanceKm);
}

interface MosqueRow {
  id: string;
  name: string;
  type: 'mosque' | 'prayer_room';
  area: string | null;
  address: string;
  lat: number;
  lng: number;
  jumaah_time?: string | null;
  open_until?: string | null;
  womens_area?: boolean | null;
  steps?: Array<[string, string]> | null;
}

interface GoogleMosque {
  id?: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
}

const normName = (n: string) => n.toLowerCase().replace(/^(masjid|musollah|surau)\s+/, '').replace(/[^a-z0-9]/g, '');

export async function fetchMosques(loc: LatLng = SG_CENTER): Promise<Mosque[]> {
  let rows: MosqueRow[] = [];
  let google: GoogleMosque[] = [];
  try {
    const res = await fetchT(placesUrl('mosques', loc));
    if (!res.ok) throw new Error(`mosques HTTP ${res.status}`);
    const json = (await res.json()) as { dbPlaces?: MosqueRow[]; places?: GoogleMosque[] };
    rows = json.dbPlaces ?? [];
    google = json.places ?? [];
  } catch {
    return seedMosques(loc);
  }
  const curated = rows
    .filter((r) => typeof r.lat === 'number' && typeof r.lng === 'number')
    .map<Mosque>((r) => ({
      id: String(r.id),
      name: r.name,
      type: r.type === 'prayer_room' ? 'Musholla' : 'Masjid',
      area: r.area ?? '',
      address: r.address ?? '',
      distanceKm: round1(haversineKm(loc, { lat: r.lat, lng: r.lng })),
      jemaahTime: r.jumaah_time ?? undefined,
      emoji: r.type === 'prayer_room' ? '🏪' : '🕌',
      coordinates: { lat: r.lat, lng: r.lng },
      openUntil: r.open_until ?? undefined,
      women: r.womens_area ?? undefined,
      steps: r.steps ?? undefined,
    }));
  // Google fills in masjids we haven't curated yet; curated rows win on name clashes.
  const seen = new Set(curated.map((m) => normName(m.name)));
  const extra = google
    .filter((g) => g.location && g.displayName?.text && !seen.has(normName(g.displayName.text)))
    .map<Mosque>((g) => ({
      id: `g_${g.id ?? g.displayName!.text}`,
      name: g.displayName!.text,
      type: 'Masjid',
      area: (g.formattedAddress ?? '').split(',')[0],
      address: g.formattedAddress ?? '',
      distanceKm: round1(haversineKm(loc, { lat: g.location!.latitude, lng: g.location!.longitude })),
      emoji: '🕌',
      coordinates: { lat: g.location!.latitude, lng: g.location!.longitude },
    }));
  const all = [...curated, ...extra].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 60);
  return all.length ? all : seedMosques(loc);
}

// ── Halal food ───────────────────────────────────────────────────────────────
export interface HalalItem {
  id: string;
  name: string;
  cuisine: string;
  district: string; // used for search only
  distanceKm: number;
  rating: number; // 0 = unknown (hidden in UI)
  tag: string | null;
  emoji: string;
  certified: boolean; // halal_certified -> shows "✦ MUIS"
  coordinates: LatLng;
}

interface FoodRow {
  id: string;
  name: string;
  type: string | null;
  address: string;
  lat: number;
  lng: number;
  certification: 'halal_certified' | 'muslim_owned' | null;
  cuisine: string[] | null;
}

interface GoogleFood {
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  types?: string[];
}

export function seedFood(loc: LatLng = SG_CENTER): HalalItem[] {
  return SEED_FOOD.map<HalalItem>((r) => ({
    id: r.id,
    name: r.name,
    cuisine: r.cuisine,
    district: r.address,
    distanceKm: round1(haversineKm(loc, { lat: r.lat, lng: r.lng })),
    rating: r.rating,
    tag: null,
    emoji: pickFoodEmoji(`${r.cuisine} ${r.name}`),
    certified: r.certified,
    coordinates: { lat: r.lat, lng: r.lng },
  })).sort((a, b) => a.distanceKm - b.distanceKm);
}

export async function fetchHalalFood(loc: LatLng = SG_CENTER): Promise<HalalItem[]> {
  let json: { dbPlaces?: FoodRow[]; places?: GoogleFood[] };
  try {
    const res = await fetchT(placesUrl('food', loc), 15000);
    if (!res.ok) throw new Error(`food HTTP ${res.status}`);
    json = (await res.json()) as typeof json;
  } catch {
    // unreachable (CORS on web, offline): keep the curated set
    return seedFood(loc);
  }

  const db = (json.dbPlaces ?? [])
    .filter((r) => typeof r.lat === 'number' && typeof r.lng === 'number')
    .map<HalalItem>((r) => {
      const cuisine = Array.isArray(r.cuisine) && r.cuisine.length
        ? r.cuisine.join(' · ')
        : r.type || 'Halal';
      const certified = r.certification === 'halal_certified';
      return {
        id: `db_${r.id}`,
        name: r.name,
        cuisine,
        district: r.address ?? '',
        distanceKm: round1(haversineKm(loc, { lat: r.lat, lng: r.lng })),
        rating: 0,
        tag: r.certification === 'muslim_owned' ? 'Muslim-owned' : null,
        emoji: pickFoodEmoji(`${cuisine} ${r.name}`),
        certified,
        coordinates: { lat: r.lat, lng: r.lng },
      };
    });

  const goog = (json.places ?? [])
    .filter((p) => p.location)
    .map<HalalItem>((p, i) => {
      const cuisine = prettyTypes(p.types) || 'Halal';
      const name = p.displayName?.text ?? 'Restaurant';
      return {
        id: `g_${i}_${name}`,
        name,
        cuisine,
        district: p.formattedAddress ?? '',
        distanceKm: round1(
          haversineKm(loc, {
            lat: p.location!.latitude,
            lng: p.location!.longitude,
          })
        ),
        rating: p.rating ?? 0,
        tag: null,
        emoji: pickFoodEmoji(`${cuisine} ${name}`),
        certified: false,
        coordinates: { lat: p.location!.latitude, lng: p.location!.longitude },
      };
    });

  // db (curated/certified) first, then Google; dedupe by name.
  const seen = new Set<string>();
  const out: HalalItem[] = [];
  for (const item of [...db, ...goog]) {
    const k = item.name.toLowerCase().trim();
    if (k && seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  if (!out.length) return seedFood(loc);
  return out.sort((a, b) => a.distanceKm - b.distanceKm);
}
