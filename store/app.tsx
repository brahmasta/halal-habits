import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrayerKey, SKY_ORDER } from '@/constants/theme';

export type Method = 'own' | 'jamaah' | 'friends' | 'qada';
export interface Checkin {
  at: string; // ISO
  method: Method;
  onTime: boolean;
}
export type Checkins = Record<string, Partial<Record<PrayerKey, Checkin>>>; // date -> prayer -> checkin

export interface Friend {
  id: string;
  name: string;
  streak: number;
  sky: PrayerKey;
}

export interface AppState {
  hydrated: boolean;
  onboarded: boolean;
  name: string;
  goals: number[];
  checkins: Checkins;
  reminders: Record<PrayerKey, boolean>;
  findFilters: number[];
  theme: 'system' | 'light' | 'dark';
  circle: Friend[];
  saved: string[]; // food / place ids
}

const DEFAULT_CIRCLE: Friend[] = [
  { id: 'hafiz', name: 'Hafiz', streak: 31, sky: 'subuh' },
  { id: 'nur', name: 'Nur', streak: 18, sky: 'maghrib' },
  { id: 'irfan', name: 'Irfan', streak: 4, sky: 'asar' },
];

const initial: AppState = {
  hydrated: false,
  onboarded: false,
  name: 'Aisha',
  goals: [0, 1, 3, 5],
  checkins: {},
  reminders: { subuh: true, zohor: true, asar: true, maghrib: true, isyak: true },
  findFilters: [0, 3],
  theme: 'system',
  circle: DEFAULT_CIRCLE,
  saved: [],
};

type Action =
  | { type: 'hydrate'; state: Partial<AppState> }
  | { type: 'onboarded'; name?: string }
  | { type: 'goals'; goals: number[] }
  | { type: 'checkin'; date: string; prayer: PrayerKey; checkin: Checkin }
  | { type: 'reminder'; prayer: PrayerKey; on: boolean }
  | { type: 'findFilters'; filters: number[] }
  | { type: 'theme'; theme: AppState['theme'] }
  | { type: 'toggleSaved'; id: string }
  | { type: 'reset' };

function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'hydrate':
      return { ...s, ...a.state, hydrated: true };
    case 'onboarded':
      return { ...s, onboarded: true, name: a.name ?? s.name };
    case 'goals':
      return { ...s, goals: a.goals };
    case 'checkin':
      return {
        ...s,
        checkins: { ...s.checkins, [a.date]: { ...(s.checkins[a.date] ?? {}), [a.prayer]: a.checkin } },
      };
    case 'reminder':
      return { ...s, reminders: { ...s.reminders, [a.prayer]: a.on } };
    case 'findFilters':
      return { ...s, findFilters: a.filters };
    case 'theme':
      return { ...s, theme: a.theme };
    case 'toggleSaved':
      return {
        ...s,
        saved: s.saved.includes(a.id) ? s.saved.filter((x) => x !== a.id) : [...s.saved, a.id],
      };
    case 'reset':
      return { ...initial, hydrated: true };
  }
}

const KEY = 'halalhabit.v2';
const Ctx = createContext<{ state: AppState; dispatch: React.Dispatch<Action> }>({
  state: initial,
  dispatch: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const parsed = raw ? (JSON.parse(raw) as Partial<AppState>) : {};
        dispatch({ type: 'hydrate', state: seedIfEmpty(parsed) });
      })
      .catch(() => dispatch({ type: 'hydrate', state: seedIfEmpty({}) }));
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const { hydrated: _h, ...persist } = state;
    AsyncStorage.setItem(KEY, JSON.stringify(persist)).catch(() => {});
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  return useContext(Ctx);
}

// ── helpers ──────────────────────────────────────────────────────────────────

export function dateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function shiftKey(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

/** Seed a believable history on first launch so the streak views aren't empty. */
function seedIfEmpty(p: Partial<AppState>): Partial<AppState> {
  if (p.checkins && Object.keys(p.checkins).length) return p;
  const checkins: Checkins = {};
  for (let i = 1; i <= 16; i++) {
    const k = shiftKey(-i);
    const day: Partial<Record<PrayerKey, Checkin>> = {};
    SKY_ORDER.forEach((pr, r) => {
      // a few deliberate misses, matching the design's sample grid
      const miss = (i === 13 && r === 0) || (i === 15 && r === 2) || (i === 13 && r === 3);
      if (miss) return;
      day[pr] = { at: k, method: i % 3 === 0 ? 'jamaah' : 'own', onTime: true };
    });
    checkins[k] = day;
  }
  return { ...p, checkins };
}

/** A day counts when all five are checked in. Streak = consecutive full days ending yesterday (or today if complete). */
export function computeStreak(checkins: Checkins): { current: number; best: number } {
  const full = (k: string) => {
    const d = checkins[k];
    return !!d && SKY_ORDER.every((p) => !!d[p]);
  };
  let current = 0;
  let offset = full(dateKey()) ? 0 : 1;
  while (full(shiftKey(-offset))) {
    current++;
    offset++;
  }
  // best: scan all keys
  const keys = Object.keys(checkins).filter(full).sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of keys) {
    const d = new Date(k + 'T00:00:00');
    if (prev && d.getTime() - prev.getTime() === 86400000) run++;
    else run = 1;
    best = Math.max(best, run);
    prev = d;
  }
  return { current, best: Math.max(best, current) };
}

export function countMethodThisMonth(checkins: Checkins, method: Method): number {
  const now = new Date();
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  let n = 0;
  for (const [k, day] of Object.entries(checkins)) {
    if (!k.startsWith(prefix)) continue;
    for (const c of Object.values(day)) if (c?.method === method) n++;
  }
  return n;
}
