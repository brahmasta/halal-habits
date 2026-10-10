import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapPanelProps } from './MapPanel.types';

// Leaflet is bundled (no CDN) so the map never depends on unpkg being reachable.

const SG = { lat: 1.3021, lng: 103.8567 };

// OpenStreetMap raster tiles (no API key). A CSS filter mutes them to match the Chalk / Ink bases.
const OSM_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTR = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
let styled = false;
function ensureStyles() {
  if (styled || typeof document === 'undefined') return;
  styled = true;
  const st = document.createElement('style');
  st.textContent = `
.hh-map-light .leaflet-tile-pane{filter:grayscale(.55) sepia(.16) saturate(.75) brightness(1.04) contrast(.94)}
.hh-map-dark .leaflet-tile-pane{filter:invert(1) hue-rotate(180deg) grayscale(.5) brightness(.78) contrast(.9)}
.hh-map .leaflet-control-attribution{font:10px Geist_400Regular,Geist,system-ui,sans-serif;color:#5C5F59;background:rgba(250,250,247,.75);padding:1px 6px;border-radius:999px 0 0 0}
.hh-map-dark .leaflet-control-attribution{color:#A4A79F;background:rgba(27,30,27,.75)}
.hh-map .leaflet-control-attribution a{color:inherit}`;
  document.head.appendChild(st);
}
const FONT = 'Geist_600SemiBold,Geist,system-ui,sans-serif';
const MOSQUE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c-1.5 3-3 4-3 6a3 3 0 006 0c0-2-1.5-3-3-6z"/><path d="M5 11a7 7 0 0114 0v10H5z"/><path d="M9 21v-5a3 3 0 016 0v5"/></svg>`;

function pill(label: string, on: boolean, c: { ink: string; bg: string; surface: string; ring: string }) {
  const html = `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);width:max-content">
    <div style="padding:${on ? '7px 12px' : '5px 10px'};border-radius:999px;background:${on ? c.ink : c.surface};color:${on ? c.bg : c.ink};font:600 ${on ? 12.5 : 11.5}px ${FONT};box-shadow:0 0 0 1px ${c.ring},0 10px 20px -10px rgba(18,20,18,0.4);white-space:nowrap">${label}</div>
    <div style="width:2px;height:8px;background:${on ? c.ink : '#A3A59E'}"></div></div>`;
  return L.divIcon({ className: '', html, iconSize: [0, 0], iconAnchor: [0, 0] });
}

function masjidPill(label: string, brand: string, brandInk: string) {
  const html = `<div style="transform:translate(-50%,-50%);display:flex;align-items:center;gap:6px;padding:5px 10px 5px 6px;border-radius:999px;background:${brand};color:${brandInk};font:600 11px ${FONT};white-space:nowrap;width:max-content;box-shadow:0 8px 18px -8px rgba(0,0,0,0.4)">${MOSQUE}${label}</div>`;
  return L.divIcon({ className: '', html, iconSize: [0, 0], iconAnchor: [0, 0] });
}

export function MapPanel({ markers, center, userLocation, zoom = 15, height = 470, showYouAreHere = true, onMarkerPress, route, interactive = true, dark, ink, bg, surface, ring, brand = '#24402F', brandInk = '#F3F1EC', style }: MapPanelProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const pressRef = useRef(onMarkerPress);
  pressRef.current = onMarkerPress;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const c = center ?? SG;
    const u = userLocation ?? c;
    try {
      if (!mapRef.current) {
        ensureStyles();
        mapRef.current = L.map(el, {
          zoomControl: false,
          attributionControl: false,
          dragging: interactive,
          scrollWheelZoom: false,
          touchZoom: interactive,
          doubleClickZoom: interactive,
          boxZoom: interactive,
          keyboard: interactive,
        }).setView([c.lat, c.lng], zoom);
        L.tileLayer(OSM_URL, { maxZoom: 19, attribution: OSM_ATTR }).addTo(mapRef.current);
        L.control.attribution({ prefix: false, position: 'bottomright' }).addTo(mapRef.current);
        layerRef.current = L.layerGroup().addTo(mapRef.current);
        setTimeout(() => mapRef.current?.invalidateSize(), 150);
      } else {
        mapRef.current.panTo([c.lat, c.lng], { animate: true, duration: 0.6 });
      }
      const grp = layerRef.current!;
      grp.clearLayers();
      const colours = { ink, bg, surface, ring };
      if (route && route.length > 1) {
        L.polyline(route.map((p) => [p.lat, p.lng] as [number, number]), { color: ink, weight: 2.5, dashArray: '2.5 4', lineCap: 'round', interactive: false }).addTo(grp);
      }
      markers.forEach((m) => {
        if (typeof m.lat === 'number' && typeof m.lng === 'number') {
          const icon = m.kind === 'masjid' ? masjidPill(m.label, brand, brandInk) : pill(m.label, !!m.selected, colours);
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
    } catch {
      setFailed(true);
    }
  }, [markers, center?.lat, center?.lng, userLocation?.lat, userLocation?.lng, zoom, showYouAreHere, dark, ink, bg, surface, ring, brand, brandInk, route, interactive]);

  // The container can mount at 0×0 (hidden tab, animated layout); re-measure whenever it resizes.
  useEffect(() => {
    const el = elRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => mapRef.current?.invalidateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(
    () => () => {
      mapRef.current?.remove();
      mapRef.current = null;
    },
    []
  );

  return (
    <div style={{ position: 'relative', height, width: '100%', ...(style as any) }}>
      <div ref={elRef} className={`hh-map ${dark ? 'hh-map-dark' : 'hh-map-light'}`} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: dark ? '#1B1E1B' : '#E6E3DA', pointerEvents: interactive ? 'auto' : 'none' }} />
      {failed ? (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `500 13px ${FONT}`, color: '#5C5F59' }}>Map unavailable</div>
      ) : null}
    </div>
  );
}
