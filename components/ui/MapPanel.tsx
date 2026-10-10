import { useEffect, useRef } from 'react';
import { Platform, Text, View, ViewStyle } from 'react-native';
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
        {markers.map((m) =>
          m.kind === 'masjid' ? (
            <Marker key={m.id} coordinate={{ latitude: m.lat, longitude: m.lng }} anchor={{ x: 0.5, y: 0.5 }} onPress={() => onMarkerPress?.(m.id)} tracksViewChanges={false}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingLeft: 6, paddingRight: 10, borderRadius: 999, backgroundColor: brand, boxShadow: '0 8px 18px -8px rgba(0,0,0,0.4)' } as ViewStyle}>
                <Icon name="mosque-glyph" size={14} color={brandInk} />
                <Text style={{ fontFamily: Fonts.semibold, fontSize: 11, color: brandInk }} numberOfLines={1}>{m.label}</Text>
              </View>
            </Marker>
          ) : (
            <Marker key={m.id} coordinate={{ latitude: m.lat, longitude: m.lng }} anchor={{ x: 0.5, y: 1 }} onPress={() => onMarkerPress?.(m.id)} tracksViewChanges={false}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ paddingVertical: m.selected ? 7 : 5, paddingHorizontal: m.selected ? 12 : 10, borderRadius: 999, backgroundColor: m.selected ? ink : surface, boxShadow: `0 0 0 1px ${ring}, 0 10px 20px -10px rgba(18,20,18,0.4)` } as ViewStyle}>
                  <Text style={{ fontFamily: Fonts.semibold, fontSize: m.selected ? 12.5 : 11.5, color: m.selected ? bg : ink }}>{m.label}</Text>
                </View>
                <View style={{ width: 2, height: 8, backgroundColor: m.selected ? ink : '#A3A59E' }} />
              </View>
            </Marker>
          )
        )}
        {showYouAreHere ? (
          <Marker coordinate={{ latitude: u.lat, longitude: u.lng }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={{ width: 18, height: 18, borderRadius: 99, backgroundColor: '#3A6FD8', boxShadow: '0 0 0 4px #fff, 0 0 0 16px rgba(58,111,216,0.16)' } as ViewStyle} />
          </Marker>
        ) : null}
      </MapView>
    </View>
  );
}
