import { View } from 'react-native';
import type { MapPanelProps } from './MapPanel.types';

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

export function MapPanel({
  markers,
  center,
  height = 160,
  rounded = 'all',
  showYouAreHere = true,
  style,
}: MapPanelProps) {
  const c = center ?? SG;
  const radius =
    rounded === 'top'
      ? { borderTopLeftRadius: 20, borderTopRightRadius: 20 }
      : { borderRadius: 20 };

  if (!MapView) {
    return <View style={[{ height, backgroundColor: '#E9EFF7' }, radius, style]} />;
  }

  return (
    <View style={[{ height, overflow: 'hidden' }, radius, style]}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: c.lat,
          longitude: c.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {markers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.lat, longitude: m.lng }}
            title={m.label}
          >
            <View
              style={{
                width: 18,
                height: 18,
                backgroundColor: m.color,
                borderWidth: 2,
                borderColor: '#fff',
                borderTopLeftRadius: 9,
                borderTopRightRadius: 9,
                borderBottomLeftRadius: 9,
                borderBottomRightRadius: 0,
                transform: [{ rotate: '-45deg' }],
              }}
            />
          </Marker>
        ))}
        {showYouAreHere && (
          <Marker coordinate={{ latitude: c.lat, longitude: c.lng }}>
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: '#fff',
                borderWidth: 3,
                borderColor: '#0B7A4F',
              }}
            />
          </Marker>
        )}
      </MapView>
    </View>
  );
}
