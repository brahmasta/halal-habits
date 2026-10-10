import { useEffect, useRef } from 'react';
import type { MapPanelProps } from './MapPanel.types';

const SG = { lat: 1.3021, lng: 103.8567 };
const LEAFLET_VER = '1.9.4';

// Load Leaflet from CDN once (avoids bundler/CSS concerns; web only).
let leafletPromise: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://unpkg.com/leaflet@${LEAFLET_VER}/dist/leaflet.css`;
      link.setAttribute('data-leaflet', '1');
      document.head.appendChild(link);
    }
    const s = document.createElement('script');
    s.src = `https://unpkg.com/leaflet@${LEAFLET_VER}/dist/leaflet.js`;
    s.async = true;
    s.onload = () => resolve((window as any).L);
    s.onerror = () => reject(new Error('leaflet load failed'));
    document.body.appendChild(s);
  });
  return leafletPromise;
}

const FONT = "Geist_600SemiBold,Geist,system-ui,sans-serif";
const MOSQUE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c-1.5 3-3 4-3 6a3 3 0 006 0c0-2-1.5-3-3-6z"/><path d="M5 11a7 7 0 0114 0v10H5z"/><path d="M9 21v-5a3 3 0 016 0v5"/></svg>`;

function pill(L: any, label: string, on: boolean, c: { ink: string; bg: string; surface: string; ring: string }) {
  const html = `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);width:max-content">
    <div style="padding:${on ? '7px 12px' : '5px 10px'};border-radius:999px;background:${on ? c.ink : c.surface};color:${on ? c.bg : c.ink};font:600 ${on ? 12.5 : 11.5}px ${FONT};box-shadow:0 0 0 1px ${c.ring},0 10px 20px -10px rgba(18,20,18,0.4);white-space:nowrap">${label}</div>
    <div style="width:2px;height:8px;background:${on ? c.ink : '#A3A59E'}"></div></div>`;
  return L.divIcon({ className: '', html, iconSize: [0, 0], iconAnchor: [0, 0] });
}

function masjidPill(L: any, label: string, brand: string, brandInk: string) {
  const html = `<div style="transform:translate(-50%,-50%);display:flex;align-items:center;gap:6px;padding:5px 10px 5px 6px;border-radius:999px;background:${brand};color:${brandInk};font:600 11px ${FONT};white-space:nowrap;width:max-content;box-shadow:0 8px 18px -8px rgba(0,0,0,0.4)">${MOSQUE}${label}</div>`;
  return L.divIcon({ className: '', html, iconSize: [0, 0], iconAnchor: [0, 0] });
}

export function MapPanel({ markers, center, userLocation, zoom = 15, height = 470, showYouAreHere = true, onMarkerPress, route, interactive = true, dark, ink, bg, surface, ring, brand = '#24402F', brandInk = '#F3F1EC', style }: MapPanelProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const pressRef = useRef(onMarkerPress);
  pressRef.current = onMarkerPress;

  useEffect(() => {
    let cancelled = false;
    const c = center ?? SG;
    const u = userLocation ?? c;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !elRef.current) return;
        if (!mapRef.current) {
          mapRef.current = L.map(elRef.current, {
            zoomControl: false,
            attributionControl: false,
            dragging: interactive,
            scrollWheelZoom: false,
            touchZoom: interactive,
            doubleClickZoom: interactive,
            boxZoom: interactive,
            keyboard: interactive,
          }).setView([c.lat, c.lng], zoom);
          L.tileLayer(`https://{s}.basemaps.cartocdn.com/${dark ? 'dark_nolabels' : 'light_nolabels'}/{z}/{x}/{y}{r}.png`, { maxZoom: 19 }).addTo(mapRef.current);
          L.tileLayer(`https://{s}.basemaps.cartocdn.com/${dark ? 'dark_only_labels' : 'light_only_labels'}/{z}/{x}/{y}{r}.png`, { maxZoom: 19, opacity: 0.7 }).addTo(mapRef.current);
          layerRef.current = L.layerGroup().addTo(mapRef.current);
          setTimeout(() => mapRef.current && mapRef.current.invalidateSize(), 150);
        } else {
          mapRef.current.panTo([c.lat, c.lng], { animate: true, duration: 0.6 });
        }
        const grp = layerRef.current;
        grp.clearLayers();
        const colours = { ink, bg, surface, ring };
        if (route && route.length > 1) {
          L.polyline(route.map((p) => [p.lat, p.lng]), { color: ink, weight: 2.5, dashArray: '2.5 4', lineCap: 'round', interactive: false }).addTo(grp);
        }
        markers.forEach((m) => {
          if (typeof m.lat === 'number' && typeof m.lng === 'number') {
            const icon = m.kind === 'masjid' ? masjidPill(L, m.label, brand, brandInk) : pill(L, m.label, !!m.selected, colours);
            const mk = L.marker([m.lat, m.lng], { icon, zIndexOffset: m.selected ? 1000 : 0, interactive }).addTo(grp);
            mk.on('click', () => pressRef.current?.(m.id));
          }
        });
        if (showYouAreHere) {
          const here = L.divIcon({
            className: '',
            html: `<div style="width:18px;height:18px;border-radius:50%;background:#3A6FD8;box-shadow:0 0 0 4px #fff,0 0 0 16px rgba(58,111,216,0.16)"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          });
          L.marker([u.lat, u.lng], { icon: here, interactive: false }).addTo(grp);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [markers, center?.lat, center?.lng, userLocation?.lat, userLocation?.lng, zoom, showYouAreHere, dark, ink, bg, surface, ring, brand, brandInk, route, interactive]);

  useEffect(
    () => () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    },
    []
  );

  return <div ref={elRef} style={{ height, width: '100%', overflow: 'hidden', background: dark ? '#1B1E1B' : '#E6E3DA', pointerEvents: interactive ? 'auto' : 'none', ...(style as any) }} />;
}
