// Curated halal spots around Kampong Glam / Bugis, used when the live food API is unreachable
// (e.g. CORS on web, offline). Coordinates approximate.

export interface SeedFood {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  certified: boolean;
}

export const SEED_FOOD: SeedFood[] = [
  { id: 'seed_zamzam', name: 'Zam Zam', cuisine: 'Murtabak · Briyani', address: '697 North Bridge Rd', lat: 1.3023, lng: 103.8587, rating: 4.5, certified: true },
  { id: 'seed_malayan_council', name: 'The Malayan Council', cuisine: 'Modern Malay', address: '22 Dunlop St', lat: 1.3064, lng: 103.8528, rating: 4.4, certified: true },
  { id: 'seed_kg_cafe', name: 'Kampong Glam Café', cuisine: 'Nasi lemak · Kopi', address: '17 Bussorah St', lat: 1.3016, lng: 103.8597, rating: 4.3, certified: true },
  { id: 'seed_hjh_maimunah', name: 'Hjh Maimunah', cuisine: 'Nasi Padang', address: '11 Jln Pisang', lat: 1.3036, lng: 103.8594, rating: 4.7, certified: true },
  { id: 'seed_tarboush', name: 'Tarboush', cuisine: 'Lebanese · Grill', address: '85 Arab St', lat: 1.3021, lng: 103.8578, rating: 4.5, certified: true },
  { id: 'seed_al_tasneem', name: 'Al Tasneem', cuisine: 'Indian · Briyani', address: '727 North Bridge Rd', lat: 1.3025, lng: 103.8596, rating: 4.6, certified: true },
  { id: 'seed_all_things_delicious', name: 'All Things Delicious', cuisine: 'Cafe · Brunch', address: '34 Arab St', lat: 1.3014, lng: 103.8581, rating: 4.4, certified: true },
  { id: 'seed_rumah_makan_minang', name: 'Rumah Makan Minang', cuisine: 'Nasi Padang', address: '18 Kandahar St', lat: 1.3028, lng: 103.8598, rating: 4.3, certified: true },
];
