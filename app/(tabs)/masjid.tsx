import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { SectionDivider } from '../../components/ui/SectionDivider';
import { Colors, Fonts, Radius, Shadow } from '../../constants/theme';

const W = Dimensions.get('window').width;

type PlaceType = 'Masjid' | 'Musholla';
type Filter = 'All' | PlaceType;

interface MasjidPlace {
  id: string;
  name: string;
  type: PlaceType;
  area: string;
  address: string;
  distanceKm: number;
  jemaahTime?: string;
  emoji: string;
}

const MASJIDS: MasjidPlace[] = [
  {
    id: '1',
    name: 'Masjid Sultan',
    type: 'Masjid',
    area: 'Arab Street',
    address: '3 Muscat St, Singapore 198833',
    distanceKm: 1.1,
    jemaahTime: 'Zohor 1:30 PM',
    emoji: '🕌',
  },
  {
    id: '2',
    name: 'Masjid Hajjah Fatimah',
    type: 'Masjid',
    area: 'Jalan Sultan',
    address: '4001 Beach Rd, Singapore 199597',
    distanceKm: 1.4,
    jemaahTime: 'Maghrib 7:10 PM',
    emoji: '🕌',
  },
  {
    id: '3',
    name: 'Masjid Alkaff Kampung Melayu',
    type: 'Masjid',
    area: 'Geylang',
    address: '80 Lorong 35, Geylang',
    distanceKm: 3.2,
    jemaahTime: 'Asar 4:00 PM',
    emoji: '🕌',
  },
  {
    id: '4',
    name: 'Masjid Omar Kampong Melaka',
    type: 'Masjid',
    area: 'Chinatown',
    address: '1 Omar Rd, Singapore 059701',
    distanceKm: 2.0,
    jemaahTime: 'Dhuhr 1:15 PM',
    emoji: '🕌',
  },
  {
    id: '5',
    name: 'Musholla Bugis+',
    type: 'Musholla',
    area: 'Bugis',
    address: '201 Victoria St, #04-10 Bugis+',
    distanceKm: 0.5,
    emoji: '🏢',
  },
  {
    id: '6',
    name: 'Musholla Raffles City',
    type: 'Musholla',
    area: 'City Hall',
    address: '252 North Bridge Rd, #03-11',
    distanceKm: 0.8,
    emoji: '🏢',
  },
  {
    id: '7',
    name: 'Musholla Marina Square',
    type: 'Musholla',
    area: 'Marina',
    address: '6 Raffles Blvd, #03-100',
    distanceKm: 1.2,
    emoji: '🏢',
  },
  {
    id: '8',
    name: 'Musholla Suntec City',
    type: 'Musholla',
    area: 'City Hall',
    address: '3 Temasek Blvd, Level 3',
    distanceKm: 1.0,
    emoji: '🏢',
  },
];

let MapView: React.ComponentType<any> | null = null;
let MapMarker: React.ComponentType<any> | null = null;
try {
  const rn_maps = require('react-native-maps');
  MapView = rn_maps.default;
  MapMarker = rn_maps.Marker;
} catch {
  // Maps not available
}

export default function MasjidScreen() {
  const [filter, setFilter] = useState<Filter>('All');

  const filtered =
    filter === 'All'
      ? MASJIDS
      : MASJIDS.filter((m) => m.type === filter);

  const filters: Filter[] = ['All', 'Masjid', 'Musholla'];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      edges={['top']}
    >
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <ScreenHeader
          background={Colors.sky}
          eyebrow="📍 Near Singapore CBD"
          title={'Masjid\n& Musholla'}
          height={200}
        />

        {/* Map */}
        <View
          style={{
            marginTop: -24,
            marginHorizontal: 16,
            height: 160,
            borderRadius: Radius.lg,
            overflow: 'hidden',
            ...Shadow.cardHover,
          }}
        >
          {MapView ? (
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: 1.3,
                longitude: 103.8565,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              }}
            >
              {MapMarker &&
                MASJIDS.map((m) => (
                  <MapMarker
                    key={m.id}
                    coordinate={{
                      latitude:
                        1.3 + (parseInt(m.id) * 0.007 - 0.025),
                      longitude:
                        103.857 + (parseInt(m.id) * 0.005 - 0.02),
                    }}
                    title={m.name}
                  />
                ))}
            </MapView>
          ) : (
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.skyLight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 32 }}>🗺️</Text>
              <Text
                style={{
                  fontFamily: Fonts.bodyMedium,
                  color: Colors.sky,
                  fontSize: 13,
                  marginTop: 6,
                }}
              >
                Map · Singapore CBD Area
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.body,
                  color: Colors.inkDim,
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                1.300°N, 103.857°E
              </Text>
            </View>
          )}
        </View>

        {/* Filter pills */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            marginTop: 20,
            gap: 8,
          }}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: Radius.pill,
                backgroundColor: filter === f ? Colors.sky : Colors.white,
                borderWidth: 1,
                borderColor: filter === f ? Colors.sky : Colors.border,
                ...(filter === f
                  ? {
                      shadowColor: Colors.sky,
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.2,
                      shadowRadius: 6,
                      elevation: 3,
                    }
                  : {}),
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontFamily: filter === f ? Fonts.bodySemiBold : Fonts.body,
                  fontSize: 13,
                  color: filter === f ? Colors.white : Colors.inkLight,
                }}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <SectionDivider />

        {/* Masjid / Musholla list */}
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {filtered.map((place, i) => (
            <Animated.View
              key={place.id}
              entering={FadeInDown.delay(i * 60).duration(400)}
            >
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 14,
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  {/* Icon area */}
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: Radius.md,
                      backgroundColor:
                        place.type === 'Masjid'
                          ? Colors.jadePale
                          : Colors.skyLight,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{place.emoji}</Text>
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: Fonts.bodyBold,
                          fontSize: 14,
                          color: Colors.ink,
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {place.name}
                      </Text>
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: Radius.pill,
                          backgroundColor:
                            place.type === 'Masjid'
                              ? Colors.jadeLight
                              : Colors.skyLight,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.bodySemiBold,
                            fontSize: 9,
                            color:
                              place.type === 'Masjid'
                                ? Colors.jade
                                : Colors.sky,
                            letterSpacing: 0.5,
                          }}
                        >
                          {place.type.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={{
                        fontFamily: Fonts.body,
                        fontSize: 12,
                        color: Colors.inkLight,
                        marginBottom: 4,
                      }}
                      numberOfLines={1}
                    >
                      {place.area} · {place.address}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: Fonts.bodyMedium,
                          fontSize: 12,
                          color: Colors.inkMid,
                        }}
                      >
                        📍 {place.distanceKm} km
                      </Text>
                      {place.jemaahTime && (
                        <Text
                          style={{
                            fontFamily: Fonts.bodyMedium,
                            fontSize: 11,
                            color: Colors.jade,
                          }}
                        >
                          🕐 {place.jemaahTime}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </Card>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
