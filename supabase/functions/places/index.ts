// GET /functions/v1/places?kind=mosques|food&lat=..&lng=..
// Replaces guided-salah's /api/mosques and /api/food. Returns { dbPlaces, places } —
// curated rows from Postgres plus Google Places results (cached per ~1 km cell for 24 h).
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' } });

// Singapore bounding box (the app is SG-only for now).
const SG = { latMin: 1.15, latMax: 1.48, lngMin: 103.59, lngMax: 104.09 };
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const RADIUS_DEG = 0.06; // ~6.5 km box for DB rows

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

interface GPlace {
  id?: string;
  displayName?: { text: string };
  location?: { latitude: number; longitude: number };
  formattedAddress?: string;
  rating?: number;
  types?: string[];
}

async function google(kind: 'mosques' | 'food', lat: number, lng: number): Promise<GPlace[]> {
  const key = Deno.env.get('GOOGLE_PLACES_KEY');
  if (!key) return [];
  // ~1.1 km grid cell keeps the cache hit rate high for people moving around a neighbourhood.
  const cell = `${kind}:${lat.toFixed(2)}:${lng.toFixed(2)}`;
  const { data: hit } = await db.from('places_cache').select('payload, fetched_at').eq('key', cell).maybeSingle();
  if (hit && Date.now() - new Date(hit.fetched_at).getTime() < CACHE_TTL_MS) return hit.payload as GPlace[];

  const common = { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key };
  let res: Response;
  if (kind === 'mosques') {
    res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: { ...common, 'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.formattedAddress' },
      body: JSON.stringify({ includedTypes: ['mosque'], maxResultCount: 20, locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: 5000 } } }),
    });
  } else {
    res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: { ...common, 'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.formattedAddress,places.rating,places.types' },
      body: JSON.stringify({ textQuery: 'halal food restaurant', maxResultCount: 20, locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 1000 } } }),
    });
  }
  if (!res.ok) {
    console.error(`[places] google ${kind} HTTP ${res.status}`, await res.text().catch(() => ''));
    return hit ? (hit.payload as GPlace[]) : []; // stale cache beats nothing
  }
  const places = ((await res.json()) as { places?: GPlace[] }).places ?? [];
  await db.from('places_cache').upsert({ key: cell, payload: places, fetched_at: new Date().toISOString() });
  return places;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'GET') return json({ error: 'GET only' }, 405);

  const url = new URL(req.url);
  const kind = url.searchParams.get('kind');
  const lat = Number(url.searchParams.get('lat'));
  const lng = Number(url.searchParams.get('lng'));
  if (kind !== 'mosques' && kind !== 'food') return json({ error: 'kind must be mosques or food' }, 400);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return json({ error: 'lat and lng are required' }, 400);
  if (lat < SG.latMin || lat > SG.latMax || lng < SG.lngMin || lng > SG.lngMax) return json({ dbPlaces: [], places: [], note: 'outside Singapore' });

  const table = kind === 'mosques' ? 'prayer_places' : 'halal_food';
  const [{ data: dbPlaces, error }, places] = await Promise.all([
    db.from(table).select('*').gte('lat', lat - RADIUS_DEG).lte('lat', lat + RADIUS_DEG).gte('lng', lng - RADIUS_DEG).lte('lng', lng + RADIUS_DEG).limit(200),
    google(kind, lat, lng).catch((e) => {
      console.error('[places] google error', e);
      return [] as GPlace[];
    }),
  ]);
  if (error) console.error('[places] db error', error.message);
  return json({ dbPlaces: dbPlaces ?? [], places });
});
