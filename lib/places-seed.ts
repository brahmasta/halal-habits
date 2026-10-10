// Curated fallback for masjids and mall musollahs around Bugis / Kampong Glam.
// Used when the live API returns nothing, so Find/Home never render empty.
// Coordinates are approximate; wayfinding steps are editorial.

export interface SeedPlace {
  id: string;
  name: string;
  type: 'Masjid' | 'Musholla';
  area: string;
  address: string;
  lat: number;
  lng: number;
  jemaahTime?: string;
  openUntil?: string;
  women?: boolean;
  steps?: Array<[string, string]>;
}

export const SEED_PLACES: SeedPlace[] = [
  {
    id: 'seed_bugis_junction',
    name: 'Musollah Bugis Junction',
    type: 'Musholla',
    area: 'Level 3 · beside Cinema',
    address: '200 Victoria St, Singapore 188021',
    lat: 1.2995,
    lng: 103.8553,
    openUntil: '10 PM',
    women: true,
    steps: [
      ['Take Lift B to Level 3', 'From the main atrium, past Uniqlo'],
      ['Turn left at the Cinema entrance', 'Follow signs for the family room'],
      ['Musollah is the second door', 'Wudhu area inside · shoes rack outside'],
    ],
  },
  {
    id: 'seed_masjid_sultan',
    name: 'Masjid Sultan',
    type: 'Masjid',
    area: 'Muscat St',
    address: '3 Muscat St, Singapore 198833',
    lat: 1.3024,
    lng: 103.8591,
    jemaahTime: '1:00 PM',
    openUntil: '9 PM',
    women: true,
    steps: [
      ['Enter from Muscat Street', 'The main gate faces Bussorah Mall'],
      ['Wudhu area is on the right', 'Shoe racks line the entrance'],
      ["Women's prayer hall upstairs", 'Stairs beside the main hall'],
    ],
  },
  {
    id: 'seed_bugis_plus',
    name: 'Musollah Bugis+',
    type: 'Musholla',
    area: 'Level 5 · near Kopitiam',
    address: '201 Victoria St, Singapore 188067',
    lat: 1.2999,
    lng: 103.8546,
    openUntil: '10 PM',
    women: true,
    steps: [
      ['Take the escalators to Level 5', 'Or Lift 2 from the basement'],
      ['Walk past Kopitiam', 'Keep the food court on your left'],
      ['Musollah is at the end of the corridor', 'Wudhu area inside'],
    ],
  },
  {
    id: 'seed_masjid_kassim',
    name: 'Masjid Kassim',
    type: 'Masjid',
    area: 'Changi Rd',
    address: '450 Changi Rd, Singapore 419877',
    lat: 1.3178,
    lng: 103.9067,
    jemaahTime: '1:00 PM',
    openUntil: '9 PM',
    women: true,
  },
  {
    id: 'seed_masjid_abdul_gafoor',
    name: 'Masjid Abdul Gafoor',
    type: 'Masjid',
    area: 'Dunlop St',
    address: '41 Dunlop St, Singapore 209369',
    lat: 1.3066,
    lng: 103.8534,
    jemaahTime: '1:00 PM',
    openUntil: '9 PM',
    women: true,
  },
  {
    id: 'seed_masjid_hajjah_fatimah',
    name: 'Masjid Hajjah Fatimah',
    type: 'Masjid',
    area: 'Beach Rd',
    address: '4001 Beach Rd, Singapore 199584',
    lat: 1.3034,
    lng: 103.8626,
    jemaahTime: '1:00 PM',
    openUntil: '9 PM',
    women: true,
  },
  {
    id: 'seed_masjid_malabar',
    name: 'Masjid Malabar',
    type: 'Masjid',
    area: 'Victoria St',
    address: '471 Victoria St, Singapore 198370',
    lat: 1.3046,
    lng: 103.8615,
    jemaahTime: '1:00 PM',
    openUntil: '9 PM',
    women: true,
  },
  {
    id: 'seed_suntec',
    name: 'Musollah Suntec City',
    type: 'Musholla',
    area: 'Tower 2 · Level 3',
    address: '3 Temasek Blvd, Singapore 038983',
    lat: 1.2951,
    lng: 103.859,
    openUntil: '10 PM',
    women: true,
    steps: [
      ['Head to Tower 2', 'Via the Fountain of Wealth concourse'],
      ['Take the lift to Level 3', 'Follow signs for the family room'],
      ['Musollah is beside the nursing room', 'Wudhu area inside'],
    ],
  },
  {
    id: 'seed_plaza_singapura',
    name: 'Musollah Plaza Singapura',
    type: 'Musholla',
    area: 'Level 6 · near the cinema',
    address: '68 Orchard Rd, Singapore 238839',
    lat: 1.3007,
    lng: 103.8454,
    openUntil: '10 PM',
    women: true,
  },
  {
    id: 'seed_masjid_bencoolen',
    name: 'Masjid Bencoolen',
    type: 'Masjid',
    area: 'Bencoolen St',
    address: '51 Bencoolen St, Singapore 189630',
    lat: 1.2988,
    lng: 103.8497,
    jemaahTime: '1:15 PM',
    openUntil: '9 PM',
    women: true,
  },
];
