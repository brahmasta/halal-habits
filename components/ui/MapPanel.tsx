import { useEffect, useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import Constants from 'expo-constants';
import type { MapPanelProps } from './MapPanel.types';
import { Fonts } from '@/constants/theme';
import { Icon } from './Icon';

const SG = { lat: 1.3021, lng: 103.8567 };

// iOS uses Apple Maps (no key needed). Android's Google Maps SDK throws without a key,
// so only mount it when the build was configured with GOOGLE_MAPS_ANDROID_KEY (see app.config.ts).
const MAPS_AVAILABLE = Platform.OS !== 'android' || Constants.expoConfig?.extra?.androidMapsEnabled === true;

// react-native-maps is native-only; guard the require so web/tests don't crash.
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
try {
  const m = require('react-native-maps');
  MapView = m.default;
  Marker = m.Marker;
  Polyline = m.Polyline;
} catch {
  // not available
}

// Muted warm style matching the Chalk base (Google Maps JSON style; Android + iOS with Google provider).
const MUTED_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#E6E3DA' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5C5F59' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FAFAF7' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FCFBF8' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#D5DDCF' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#D5DDCF' }] },
];

export function MapPanel({ markers, center, userLocation, height = 470, showYouAreHere = true, onMarkerPress, route, interactive = true, ink, bg, surface, ring, brand = '#24402F', brandInk = '#F3F1EC', style }: MapPanelProps) {
  const c = center ?? SG;
  const u = userLocation ?? c;
  const ref = useRef<any>(null);
  useEffect(() => {
    if (ref.current && center) ref.current.animateToRegion({ latitude: center.lat, longitude: center.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 600);
  }, [center?.lat, center?.lng]);

  if (!MapView || !MAPS_AVAILABLE) {
    // Android without a Google Maps key would crash inside the Maps SDK; show a quiet placeholder instead.
    return (
      <View style={[{ height, backgroundColor: '#E6E3DA', alignItems: 'center', justifyContent: 'center' }, style]}>
        <Icon name="map-pin" size={20} color="#5C5F59" />
        <Text style={{ fontFamily: Fonts.medium, fontSize: 12.5, color: '#5C5F59', marginTop: 6 }}>Map coming soon on this device</Text>
      </View>
    );
  }
  return (
    <View style={[{ height, overflow: 'hidden' }, style]} pointerEvents={interactive ? 'auto' : 'none'}>
      <MapView
        ref={ref}
        style={{ flex: 1 }}
        customMapStyle={MUTED_STYLE}
        initialRegion={{ latitude: c.lat, longitude: c.lng, latitudeDelta: 0.03, longitudeDelta: 0.03 }}
        showsPointsOfInterest={false}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={interactive}
        pitchEnabled={interactive}
      >
        {route && route.length > 1 ? (
          <Polyline coordinates={route.map((p) => ({ latitude: p.lat, longitude: p.lng }))} strokeColor={ink} strokeWidth={2.5} lineDashPattern={[5, 4]} />
        ) : null}
        {markers.map((m) => (
          <Pin key={m.id} m={m} ink={ink} bg={bg} surface={surface} ring={ring} brand={brand} brandInk={brandInk} onPress={() => onMarkerPress?.(m.id)} />
        ))}
        {showYouAreHere ? <YouAreHere lat={u.lat} lng={u.lng} /> : null}
      </MapView>
    </View>
  );
}

// Android renders custom marker views to a bitmap. With tracksViewChanges={false} from the start,
// that snapshot is taken before text/fonts are drawn (blank pills). Track changes briefly, then stop.
function useSettledTracking(key: string) {
  const [track, setTrack] = useState(true);
  useEffect(() => {
    setTrack(true);
    const t = setTimeout(() => setTrack(false), 800);
    return () => clearTimeout(t);
  }, [key]);
  return track;
}

type PinProps = { m: MapPanelProps['markers'][number]; ink: string; bg: string; surface: string; ring: string; brand: string; brandInk: string; onPress: () => void };

// No boxShadow inside markers: Android's bitmap snapshot draws it as a square.
function Pin({ m, ink, bg, surface, ring, brand, brandInk, onPress }: PinProps) {
  const track = useSettledTracking(`${m.label}|${m.selected ? 1 : 0}`);
  if (m.kind === 'masjid') {
    return (
      <Marker coordinate={{ latitude: m.lat, longitude: m.lng }} anchor={{ x: 0.5, y: 0.5 }} onPress={onPress} tracksViewChanges={track}>
        <View collapsable={false} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingLeft: 6, paddingRight: 10, borderRadius: 999, backgroundColor: brand, borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)' }}>
          <Icon name="mosque-glyph" size={14} color={brandInk} />
          <Text style={{ fontFamily: Fonts.semibold, fontSize: 11, color: brandInk }} numberOfLines={1}>{m.label}</Text>
        </View>
      </Marker>
    );
  }
  return (
    <Marker coordinate={{ latitude: m.lat, longitude: m.lng }} anchor={{ x: 0.5, y: 1 }} onPress={onPress} tracksViewChanges={track}>
      <View collapsable={false} style={{ alignItems: 'center' }}>
        <View style={{ paddingVertical: m.selected ? 7 : 5, paddingHorizontal: m.selected ? 12 : 10, borderRadius: 999, backgroundColor: m.selected ? ink : surface, borderWidth: 1, borderColor: m.selected ? ink : ring }}>
          <Text style={{ fontFamily: Fonts.semibold, fontSize: m.selected ? 12.5 : 11.5, color: m.selected ? bg : ink }} numberOfLines={1}>{m.label}</Text>
        </View>
        <View style={{ width: 2, height: 8, backgroundColor: m.selected ? ink : '#A3A59E' }} />
      </View>
    </Marker>
  );
}

function YouAreHere({ lat, lng }: { lat: number; lng: number }) {
  const track = useSettledTracking('you');
  return (
    <Marker coordinate={{ latitude: lat, longitude: lng }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={track}>
      <View collapsable={false} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(58,111,216,0.16)', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#3A6FD8' }} />
        </View>
      </View>
    </Marker>
  );
}
