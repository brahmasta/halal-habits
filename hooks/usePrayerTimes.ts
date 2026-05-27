import { useEffect, useState } from 'react';
import {
  fetchPrayerTimes,
  parse12h,
  formatCountdown,
  PrayerTimes,
} from '../services/prayerApi';

export interface ParsedPrayer {
  key: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  name: string;
  arabic: string;
  time: string;
  meridiem: string;
  raw: string;
  countdown: string;
}

const PRAYERS: Array<{
  key: keyof PrayerTimes;
  name: string;
  arabic: string;
}> = [
  { key: 'Fajr', name: 'Subuh', arabic: 'الفجر' },
  { key: 'Dhuhr', name: 'Zohor', arabic: 'الظهر' },
  { key: 'Asr', name: 'Asar', arabic: 'العصر' },
  { key: 'Maghrib', name: 'Maghrib', arabic: 'المغرب' },
  { key: 'Isha', name: 'Isyak', arabic: 'العشاء' },
];

export function usePrayerTimes() {
  const [prayers, setPrayers] = useState<ParsedPrayer[]>([]);
  const [hijriDate, setHijriDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextIdx, setNextIdx] = useState(0);

  useEffect(() => {
    fetchPrayerTimes()
      .then((res) => {
        const t = res.data.timings;
        const parsed: ParsedPrayer[] = PRAYERS.map((p) => {
          const { display, meridiem } = parse12h(t[p.key]);
          return {
            ...p,
            key: p.key as ParsedPrayer['key'],
            time: display,
            meridiem,
            raw: t[p.key],
            countdown: formatCountdown(t[p.key]),
          };
        });
        setPrayers(parsed);
        const now = new Date();
        const idx = parsed.findIndex((p) => {
          const [h, m] = p.raw.split(' ')[0].split(':').map(Number);
          const d = new Date();
          d.setHours(h, m, 0, 0);
          return d > now;
        });
        setNextIdx(idx >= 0 ? idx : 0);
        const hd = res.data.date.hijri;
        setHijriDate(`${hd.day} ${hd.month.en} ${hd.year}H`);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  return { prayers, hijriDate, loading, error, nextIdx };
}
