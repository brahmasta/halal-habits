import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchPrayerTimes, parse12h } from '@/services/prayerApi';
import { PrayerKey, SKY, SKY_ORDER, Sky } from '@/constants/theme';

export interface PrayerTime {
  k: PrayerKey;
  sky: Sky;
  time: string; // "1:11"
  meridiem: 'AM' | 'PM';
  minutes: number; // minutes since midnight
}

interface NowValue {
  loading: boolean;
  error: string | null;
  offline: boolean;
  times: PrayerTime[];
  syuruk: string; // "7:08 AM"
  hijri: string; // "28 Syawal"
  /** index of the next prayer (0-4). After Isyak, wraps to 0 (tomorrow's Subuh). */
  idx: number;
  next: PrayerTime | null;
  sky: Sky;
  countdown: string; // "in 4h 47m" / "in 38m"
  /** prayers whose time has already passed today */
  passed: PrayerKey[];
  now: Date;
}

const FALLBACK: Record<PrayerKey | 'syuruk', string> = {
  subuh: '05:48',
  syuruk: '07:08',
  zohor: '13:11',
  asar: '16:33',
  maghrib: '19:13',
  isyak: '20:25',
};

const Ctx = createContext<NowValue | null>(null);

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(' ')[0].split(':').map(Number);
  return h * 60 + m;
}

function build(raw: Record<PrayerKey, string>): PrayerTime[] {
  return SKY_ORDER.map((k) => {
    const { display, meridiem } = parse12h(raw[k]);
    return { k, sky: SKY[k], time: display, meridiem, minutes: toMinutes(raw[k]) };
  });
}

function fmtCountdown(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `in ${m}m`;
  return `in ${h}h ${String(m).padStart(2, '0')}m`;
}

export function NowProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useState<Record<PrayerKey, string>>({
    subuh: FALLBACK.subuh,
    zohor: FALLBACK.zohor,
    asar: FALLBACK.asar,
    maghrib: FALLBACK.maghrib,
    isyak: FALLBACK.isyak,
  });
  const [syurukRaw, setSyurukRaw] = useState(FALLBACK.syuruk);
  const [hijri, setHijri] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let alive = true;
    fetchPrayerTimes()
      .then((res) => {
        if (!alive) return;
        const t = res.data.timings;
        setRaw({ subuh: t.Fajr, zohor: t.Dhuhr, asar: t.Asr, maghrib: t.Maghrib, isyak: t.Isha });
        setSyurukRaw(t.Sunrise);
        const hd = res.data.date.hijri;
        setHijri(`${hd.day} ${hd.month.en}`);
        setOffline(false);
      })
      .catch((e) => {
        if (!alive) return;
        setError(String(e));
        setOffline(true);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // re-evaluate every minute (aligned to the minute boundary)
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(new Date());
      const ms = 60000 - (Date.now() % 60000);
      id = setTimeout(tick, ms);
    };
    id = setTimeout(tick, 60000 - (Date.now() % 60000));
    return () => clearTimeout(id);
  }, []);

  const value = useMemo<NowValue>(() => {
    const times = build(raw);
    const cur = now.getHours() * 60 + now.getMinutes();
    let idx = times.findIndex((p) => p.minutes > cur);
    let diff: number;
    if (idx === -1) {
      idx = 0;
      diff = 24 * 60 - cur + times[0].minutes;
    } else {
      diff = times[idx].minutes - cur;
    }
    const passed = times.filter((p) => p.minutes <= cur).map((p) => p.k);
    const s = parse12h(syurukRaw);
    return {
      loading,
      error,
      offline,
      times,
      syuruk: `${s.display} ${s.meridiem}`,
      hijri,
      idx,
      next: times[idx],
      sky: times[idx].sky,
      countdown: fmtCountdown(diff),
      passed,
      now,
    };
  }, [raw, syurukRaw, hijri, loading, error, offline, now]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNow(): NowValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useNow outside NowProvider');
  return v;
}
