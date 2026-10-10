-- Places backend for Halal Habit (replaces the guided-salah /api/mosques and /api/food routes).

-- Curated + Google-sourced masjids and musollahs.
create table if not exists public.prayer_places (
  id           text primary key,
  name         text not null,
  type         text not null check (type in ('mosque', 'prayer_room')),
  area         text,
  address      text not null default '',
  lat          double precision not null,
  lng          double precision not null,
  level        text,
  landmark     text,
  jumaah_time  text,
  open_until   text,
  wudhu        boolean,
  womens_area  boolean,
  steps        jsonb,            -- [[title, detail], ...] wayfinding
  phone        text,
  website      text,
  notes        text,
  source       text not null default 'curated',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists prayer_places_lat_lng on public.prayer_places (lat, lng);

-- Curated halal food (MUIS certificate data goes here once verified).
create table if not exists public.halal_food (
  id             text primary key,
  name           text not null,
  type           text,
  address        text not null default '',
  lat            double precision not null,
  lng            double precision not null,
  certification  text check (certification in ('halal_certified', 'muslim_owned')),
  muis_expiry    date,
  cuisine        text[],
  price_range    text,
  rating         numeric(2, 1),
  description    text,
  phone          text,
  website        text,
  notes          text,
  source         text not null default 'curated',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists halal_food_lat_lng on public.halal_food (lat, lng);

-- Server-side cache of Google Places responses (keeps API cost down). Service role only.
create table if not exists public.places_cache (
  key         text primary key,
  payload     jsonb not null,
  fetched_at  timestamptz not null default now()
);

-- Public read, no client writes.
alter table public.prayer_places enable row level security;
alter table public.halal_food    enable row level security;
alter table public.places_cache  enable row level security;

drop policy if exists "prayer_places are public" on public.prayer_places;
create policy "prayer_places are public" on public.prayer_places for select to anon, authenticated using (true);

drop policy if exists "halal_food is public" on public.halal_food;
create policy "halal_food is public" on public.halal_food for select to anon, authenticated using (true);
-- places_cache: no policies → only the service role (edge functions) can touch it.

-- Seed: curated Bugis / Kampong Glam masjids and mall musollahs (wayfinding is editorial; verify before launch).
insert into public.prayer_places (id, name, type, area, address, lat, lng, level, landmark, jumaah_time, open_until, wudhu, womens_area, steps) values
  ('seed_bugis_junction', 'Musollah Bugis Junction', 'prayer_room', 'Level 3 · beside Cinema', '200 Victoria St, Singapore 188021', 1.2995, 103.8553, 'Level 3', 'beside Cinema', null, '10 PM', true, true,
    '[["Take Lift B to Level 3","From the main atrium, past Uniqlo"],["Turn left at the Cinema entrance","Follow signs for the family room"],["Musollah is the second door","Wudhu area inside · shoes rack outside"]]'),
  ('seed_masjid_sultan', 'Masjid Sultan', 'mosque', 'Muscat St', '3 Muscat St, Singapore 198833', 1.3024, 103.8591, null, null, '1:00 PM', '9 PM', true, true,
    '[["Enter from Muscat Street","The main gate faces Bussorah Mall"],["Wudhu area is on the right","Shoe racks line the entrance"],["Women''s prayer hall upstairs","Stairs beside the main hall"]]'),
  ('seed_bugis_plus', 'Musollah Bugis+', 'prayer_room', 'Level 5 · near Kopitiam', '201 Victoria St, Singapore 188067', 1.2999, 103.8546, 'Level 5', 'near Kopitiam', null, '10 PM', true, true,
    '[["Take the escalators to Level 5","Or Lift 2 from the basement"],["Walk past Kopitiam","Keep the food court on your left"],["Musollah is at the end of the corridor","Wudhu area inside"]]'),
  ('seed_masjid_kassim', 'Masjid Kassim', 'mosque', 'Changi Rd', '450 Changi Rd, Singapore 419877', 1.3178, 103.9067, null, null, '1:00 PM', '9 PM', true, true, null),
  ('seed_masjid_abdul_gafoor', 'Masjid Abdul Gafoor', 'mosque', 'Dunlop St', '41 Dunlop St, Singapore 209369', 1.3066, 103.8534, null, null, '1:00 PM', '9 PM', true, true, null),
  ('seed_masjid_hajjah_fatimah', 'Masjid Hajjah Fatimah', 'mosque', 'Beach Rd', '4001 Beach Rd, Singapore 199584', 1.3034, 103.8626, null, null, '1:00 PM', '9 PM', true, true, null),
  ('seed_masjid_malabar', 'Masjid Malabar', 'mosque', 'Victoria St', '471 Victoria St, Singapore 198370', 1.3046, 103.8615, null, null, '1:00 PM', '9 PM', true, true, null),
  ('seed_suntec', 'Musollah Suntec City', 'prayer_room', 'Tower 2 · Level 3', '3 Temasek Blvd, Singapore 038983', 1.2951, 103.859, 'Level 3', 'Tower 2', null, '10 PM', true, true,
    '[["Head to Tower 2","Via the Fountain of Wealth concourse"],["Take the lift to Level 3","Follow signs for the family room"],["Musollah is beside the nursing room","Wudhu area inside"]]'),
  ('seed_plaza_singapura', 'Musollah Plaza Singapura', 'prayer_room', 'Level 6 · near the cinema', '68 Orchard Rd, Singapore 238839', 1.3007, 103.8454, 'Level 6', 'near the cinema', null, '10 PM', true, true, null),
  ('seed_masjid_bencoolen', 'Masjid Bencoolen', 'mosque', 'Bencoolen St', '51 Bencoolen St, Singapore 189630', 1.2988, 103.8497, null, null, '1:15 PM', '9 PM', true, true, null)
on conflict (id) do nothing;
