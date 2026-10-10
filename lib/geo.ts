export const KAABA = { lat: 21.4225, lng: 39.8262 };

/** Walking minutes at ~4.8 km/h, min 1. */
export function walkMin(km: number): number {
  return Math.max(1, Math.round(km / 0.08));
}

/** Initial great-circle bearing (degrees, 0 = north). */
export function qiblaBearing(from: { lat: number; lng: number }): number {
  const toR = (d: number) => (d * Math.PI) / 180;
  const φ1 = toR(from.lat);
  const φ2 = toR(KAABA.lat);
  const Δλ = toR(KAABA.lng - from.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360) + 360) % 360;
}

export function fmtDate(d = new Date()): string {
  return d.toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function fmtTime(d: Date): string {
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
}
