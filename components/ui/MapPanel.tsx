import { Text, View, ViewStyle } from 'react-native';
import type { MapPanelProps } from './MapPanel.types';
import { Fonts } from '@/constants/theme';

const SG = { lat: 1.3021, lng: 103.8567 };

// react-native-maps is native-only; guard the require so web/tests don't crash.
let MapView: any = null;
let Marker: any = null;
try {
  const m = require('react-native-maps');
  MapView = m.default;
  Marker = m.Marker;
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

export function MapPanel({ markers, center, height = 470, showYouAreHere = true, onMarkerPress, ink, bg, surface, ring, style }: MapPanelProps) {
  const c = center ?? SG;
  if (!MapView) {
    return <View style={[{ height, backgroundColor: '#E6E3DA' }, style]} />;
  }
  return (
    <View style={[{ height, overflow: 'hidden' }, style]}>
      <MapView
        style={{ flex: 1 }}
        customMapStyle={MUTED_STYLE}
        initialRegion={{ latitude: c.lat, longitude: c.lng, latitudeDelta: 0.03, longitudeDelta: 0.03 }}
        showsPointsOfInterest={false}
      >
        {markers.map((m) => (
          <Marker key={m.id} coordinate={{ latitude: m.lat, longitude: m.lng }} anchor={{ x: 0.5, y: 1 }} onPress={() => onMarkerPress?.(m.id)} tracksViewChanges={false}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ paddingVertical: m.selected ? 7 : 5, paddingHorizontal: m.selected ? 12 : 10, borderRadius: 999, backgroundColor: m.selected ? ink : surface, boxShadow: `0 0 0 1px ${ring}, 0 10px 20px -10px rgba(18,20,18,0.4)` } as ViewStyle}>
                <Text style={{ fontFamily: Fonts.semibold, fontSize: m.selected ? 12.5 : 11.5, color: m.selected ? bg : ink }}>{m.label}</Text>
              </View>
              <View style={{ width: 2, height: 8, backgroundColor: m.selected ? ink : '#A3A59E' }} />
            </View>
          </Marker>
        ))}
        {showYouAreHere ? (
          <Marker coordinate={{ latitude: c.lat, longitude: c.lng }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={{ width: 18, height: 18, borderRadius: 99, backgroundColor: '#3A6FD8', boxShadow: '0 0 0 4px #fff, 0 0 0 16px rgba(58,111,216,0.16)' } as ViewStyle} />
          </Marker>
        ) : null}
      </MapView>
    </View>
  );
}
