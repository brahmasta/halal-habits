export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface AladhanResponse {
  code: number;
  data: {
    timings: PrayerTimes;
    date: {
      hijri: { day: string; month: { en: string }; year: string };
      readable: string;
    };
    meta: { timezone: string };
  };
}

export async function fetchPrayerTimes(
  lat = 1.3521,
  lng = 103.8198
): Promise<AladhanResponse> {
  const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=11`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch prayer times');
  return res.json() as Promise<AladhanResponse>;
}

export function parse12h(time24: string): {
  display: string;
  meridiem: 'AM' | 'PM';
} {
  const [h, m] = time24.split(' ')[0].split(':').map(Number);
  const meridiem = h < 12 ? 'AM' : 'PM';
  const display = `${h % 12 || 12}:${String(m).padStart(2, '0')}`;
  return { display, meridiem };
}

export function formatCountdown(targetTime: string): string {
  const [h, m] = targetTime.split(' ')[0].split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return '';
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}
