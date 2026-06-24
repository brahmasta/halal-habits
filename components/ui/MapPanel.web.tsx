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

function teardrop(L: any, color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50% 50% 50% 0;background:${color};border:2px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(18,21,26,0.35)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 18],
  });
}

export function MapPanel({
  markers,
  center,
  zoom = 14,
  height = 160,
  rounded = 'all',
  showYouAreHere = true,
}: MapPanelProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    const c = center ?? SG;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !elRef.current) return;
        if (!mapRef.current) {
          mapRef.current = L.map(elRef.current, {
            zoomControl: false,
            attributionControl: false,
            dragging: true,
            scrollWheelZoom: false,
          }).setView([c.lat, c.lng], zoom);
          L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            { maxZoom: 19 }
          ).addTo(mapRef.current);
          layerRef.current = L.layerGroup().addTo(mapRef.current);
          setTimeout(() => mapRef.current && mapRef.current.invalidateSize(), 150);
        }
        const grp = layerRef.current;
        grp.clearLayers();
        markers.forEach((m) => {
          if (typeof m.lat === 'number' && typeof m.lng === 'number') {
            L.marker([m.lat, m.lng], { icon: teardrop(L, m.color), title: m.label }).addTo(grp);
          }
        });
        if (showYouAreHere) {
          const here = L.divIcon({
            className: '',
            html: `<div style="width:12px;height:12px;border-radius:50%;background:#fff;border:3px solid #0B7A4F;box-shadow:0 0 0 5px rgba(11,122,79,0.25)"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });
          L.marker([c.lat, c.lng], { icon: here }).addTo(grp);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [markers, center, zoom, showYouAreHere]);

  // Tear down the map instance on unmount.
  useEffect(
    () => () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    },
    []
  );

  const radius =
    rounded === 'top'
      ? { borderTopLeftRadius: 20, borderTopRightRadius: 20 }
      : { borderRadius: 20 };

  return (
    <div
      ref={elRef}
      style={{ height, width: '100%', overflow: 'hidden', background: '#e9eff7', ...radius }}
    />
  );
}
