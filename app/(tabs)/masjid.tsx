import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import { enter } from '../../components/ui/enter';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { SectionDivider } from '../../components/ui/SectionDivider';
import { Colors, Fonts, Gradients, Radius, Shadow } from '../../constants/theme';

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
    emoji: '🏪',
  },
  {
    id: '6',
    name: 'Musholla Raffles City',
    type: 'Musholla',
    area: 'City Hall',
    address: '252 North Bridge Rd, #03-11',
    distanceKm: 0.8,
    emoji: '🏪',
  },
  {
    id: '7',
    name: 'Musholla Marina Square',
    type: 'Musholla',
    area: 'Marina',
    address: '6 Raffles Blvd, #03-100',
    distanceKm: 1.2,
    emoji: '🏪',
  },
  {
    id: '8',
    name: 'Musholla Suntec City',
    type: 'Musholla',
    area: 'City Hall',
    address: '3 Temasek Blvd, Level 3',
    distanceKm: 1.0,
    emoji: '🏪',
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

// Teardrop pin used in the web map fallback.
function TeardropPin({
  color,
  size = 22,
  selected = false,
  style,
}: {
  color: string;
  size?: number;
  selected?: boolean;
  style?: any;
}) {
  return (
    <View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          backgroundColor: color,
          borderWidth: 2.5,
          borderColor: '#fff',
          borderTopLeftRadius: size / 2,
          borderTopRightRadius: size / 2,
          borderBottomLeftRadius: size / 2,
          borderBottomRightRadius: 0,
          transform: [{ rotate: '-45deg' }],
        },
        selected ? Shadow.greenGlowSoft : null,
        style,
      ]}
    />
  );
}

export default function MasjidScreen() {
  const [filter, setFilter] = useState<Filter>('All');
  const [query, setQuery] = useState('');

  const filtered = MASJIDS.filter((m) => {
    const matchesFilter = filter === 'All' || m.type === filter;
    const matchesQuery =
      query.trim() === '' ||
      m.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const filters: Filter[] = ['All', 'Masjid', 'Musholla'];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      edges={['top']}
    >
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 0 }}
      >
        <ScreenHeader
          eyebrow="Near Singapore CBD"
          eyebrowColor={Colors.blueOnDark}
          title={'Masjid\n& Musholla'}
          titleSize={32}
          glows={[
            {
              color: 'rgba(80,80,250,0.28)',
              size: 260,
              stop: 0.65,
              pos: { top: -80, right: -60 },
            },
            {
              color: 'rgba(11,122,79,0.18)',
              size: 200,
              stop: 0.7,
              pos: { bottom: -40, left: -20 },
            },
          ]}
          subtitle={
            <Text
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: 13,
                fontFamily: Fonts.medium,
              }}
            >
              {MASJIDS.length} places nearby · Asar Jemaah 4:30 PM
            </Text>
          }
        >
          {/* Map preview — full-bleed, last child of the header */}
          <View
            style={{
              marginTop: 18,
              marginHorizontal: 16,
              height: 144,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
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
              <View style={{ flex: 1 }}>
                <LinearGradient
                  colors={Gradients.map}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ ...StyleAbsoluteFill }}
                />

                {/* Faint blue grid lines */}
                <View
                  pointerEvents="none"
                  style={{ ...StyleAbsoluteFill, opacity: 0.5 }}
                >
                  {/* 3 horizontal */}
                  {[0.25, 0.5, 0.75].map((t) => (
                    <View
                      key={`h${t}`}
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: `${t * 100}%`,
                        height: 1,
                        backgroundColor: 'rgba(80,80,250,0.3)',
                      }}
                    />
                  ))}
                  {/* 3 vertical */}
                  {[0.25, 0.5, 0.75].map((t) => (
                    <View
                      key={`v${t}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: `${t * 100}%`,
                        width: 1,
                        backgroundColor: 'rgba(80,80,250,0.3)',
                      }}
                    />
                  ))}
                </View>

                {/* Green route line */}
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: 24,
                    right: 24,
                    top: '52%',
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'rgba(11,122,79,0.4)',
                  }}
                />

                {/* Four teardrop pins */}
                <TeardropPin
                  color="#0B7A4F"
                  size={30}
                  selected
                  style={{ top: 30, left: '40%' }}
                />
                <TeardropPin
                  color="#5050FA"
                  size={22}
                  style={{ top: 64, left: '20%' }}
                />
                <TeardropPin
                  color="#FCAE30"
                  size={22}
                  style={{ top: 40, right: '20%' }}
                />
                <TeardropPin
                  color="#25D092"
                  size={22}
                  style={{ bottom: 28, right: '34%' }}
                />

                {/* You-are-here dot with outer ring */}
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    bottom: 30,
                    left: '24%',
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: 'rgba(11,122,79,0.25)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 13,
                      height: 13,
                      borderRadius: 6.5,
                      backgroundColor: Colors.white,
                      borderWidth: 3,
                      borderColor: Colors.brand,
                    }}
                  />
                </View>

                {/* Bottom-right pill */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 12,
                    backgroundColor: Colors.white,
                    borderRadius: 10,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text
                    style={{
                      color: Colors.brand,
                      fontSize: 11,
                      fontFamily: Fonts.extrabold,
                    }}
                  >
                    Open full map ›
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScreenHeader>

        {/* Content */}
        <View
          style={{
            backgroundColor: Colors.bg,
            paddingTop: 20,
            paddingHorizontal: 16,
            paddingBottom: 100,
          }}
        >
          {/* Filter pills */}
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              marginBottom: 16,
            }}
          >
            {filters.map((f) => {
              const active = filter === f;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFilter(f)}
                  activeOpacity={0.8}
                  style={{
                    paddingVertical: 9,
                    paddingHorizontal: 20,
                    borderRadius: Radius.pill,
                    backgroundColor: active ? Colors.brand : Colors.white,
                    borderWidth: 1,
                    borderColor: active ? Colors.brand : Colors.border,
                    ...(active ? Shadow.greenGlowSoft : null),
                  }}
                >
                  <Text
                    style={{
                      fontFamily: active ? Fonts.bold : Fonts.medium,
                      fontSize: 13,
                      color: active ? Colors.white : Colors.muted,
                    }}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Search bar */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: Colors.white,
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 14,
              paddingVertical: 13,
              paddingHorizontal: 16,
              marginBottom: 18,
              ...Shadow.cardSubtle,
            }}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Circle cx={11} cy={11} r={8} stroke="#9AA7B8" strokeWidth={2} />
              <Path
                d="m21 21-4.35-4.35"
                stroke="#9AA7B8"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search masjid or musholla…"
              placeholderTextColor={Colors.dim}
              style={{
                flex: 1,
                fontFamily: Fonts.regular,
                fontSize: 14,
                color: Colors.heading,
                padding: 0,
              }}
            />
          </View>

          <SectionDivider />

          {/* List */}
          <View style={{ gap: 9 }}>
            {filtered.map((place, i) => {
              const isMasjid = place.type === 'Masjid';
              return (
                <Animated.View
                  key={place.id}
                  entering={enter(i * 50, 350)}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 14,
                      backgroundColor: Colors.white,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      borderRadius: 18,
                      paddingVertical: 16,
                      paddingHorizontal: 18,
                      ...Shadow.card,
                    }}
                  >
                    {/* Left tile */}
                    <View
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 16,
                        backgroundColor: isMasjid
                          ? Colors.brandTint
                          : Colors.blueTint,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 25 }}>{place.emoji}</Text>
                    </View>

                    {/* Center */}
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 5,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.bold,
                            fontSize: 15,
                            color: Colors.heading,
                          }}
                        >
                          {place.name}
                        </Text>
                        <View
                          style={{
                            paddingVertical: 3,
                            paddingHorizontal: 9,
                            borderRadius: Radius.pill,
                            backgroundColor: isMasjid
                              ? Colors.brandTint
                              : Colors.blueTint,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: Fonts.bold,
                              fontSize: 10,
                              color: isMasjid ? Colors.brand : Colors.blue,
                            }}
                          >
                            {isMasjid ? 'Masjid' : 'Musholla'}
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={{
                          fontFamily: Fonts.regular,
                          fontSize: 12,
                          color: Colors.muted,
                        }}
                      >
                        {place.area} · {place.distanceKm} km
                      </Text>

                      {place.jemaahTime ? (
                        <Text
                          style={{
                            fontFamily: Fonts.bold,
                            fontSize: 12,
                            color: Colors.goldText,
                            marginTop: 5,
                          }}
                        >
                          Jemaah {place.jemaahTime}
                        </Text>
                      ) : null}
                    </View>

                    {/* Right chevron */}
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        backgroundColor: Colors.subtleFill,
                        borderWidth: 1,
                        borderColor: Colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: Fonts.regular,
                          fontSize: 18,
                          color: Colors.dim,
                        }}
                      >
                        ›
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const StyleAbsoluteFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
