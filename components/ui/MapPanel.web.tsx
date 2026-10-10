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

function pill(L: any, label: string, on: boolean, c: { ink: string; bg: string; surface: string; ring: string }) {
  const html = `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);width:max-content">
    <div style="padding:${on ? '7px 12px' : '5px 10px'};border-radius:999px;background:${on ? c.ink : c.surface};color:${on ? c.bg : c.ink};font:600 ${on ? 12.5 : 11.5}px Geist_600SemiBold,Geist,system-ui,sans-serif;box-shadow:0 0 0 1px ${c.ring},0 10px 20px -10px rgba(18,20,18,0.4);white-space:nowrap">${label}</div>
    <div style="width:2px;height:8px;background:${on ? c.ink : '#A3A59E'}"></div></div>`;
  return L.divIcon({ className: '', html, iconSize: [0, 0], iconAnchor: [0, 0] });
}

export function MapPanel({ markers, center, zoom = 15, height = 470, showYouAreHere = true, onMarkerPress, dark, ink, bg, surface, ring, style }: MapPanelProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const pressRef = useRef(onMarkerPress);
  pressRef.current = onMarkerPress;

  useEffect(() => {
    let cancelled = false;
    const c = center ?? SG;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !elRef.current) return;
        if (!mapRef.current) {
          mapRef.current = L.map(elRef.current, { zoomControl: false, attributionControl: false, dragging: true, scrollWheelZoom: false }).setView([c.lat, c.lng], zoom);
          L.tileLayer(`https://{s}.basemaps.cartocdn.com/${dark ? 'dark_nolabels' : 'light_nolabels'}/{z}/{x}/{y}{r}.png`, { maxZoom: 19 }).addTo(mapRef.current);
          L.tileLayer(`https://{s}.basemaps.cartocdn.com/${dark ? 'dark_only_labels' : 'light_only_labels'}/{z}/{x}/{y}{r}.png`, { maxZoom: 19, opacity: 0.7 }).addTo(mapRef.current);
          layerRef.current = L.layerGroup().addTo(mapRef.current);
          setTimeout(() => mapRef.current && mapRef.current.invalidateSize(), 150);
        }
        const grp = layerRef.current;
        grp.clearLayers();
        const colours = { ink, bg, surface, ring };
        markers.forEach((m) => {
          if (typeof m.lat === 'number' && typeof m.lng === 'number') {
            const mk = L.marker([m.lat, m.lng], { icon: pill(L, m.label, !!m.selected, colours), zIndexOffset: m.selected ? 1000 : 0 }).addTo(grp);
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
          L.marker([c.lat, c.lng], { icon: here, interactive: false }).addTo(grp);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [markers, center, zoom, showYouAreHere, dark, ink, bg, surface, ring]);

  useEffect(
    () => () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    },
    []
  );

  return <div ref={elRef} style={{ height, width: '100%', overflow: 'hidden', background: dark ? '#1B1E1B' : '#E6E3DA', ...(style as any) }} />;
}
