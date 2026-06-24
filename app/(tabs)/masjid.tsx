import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import { enter } from '../../components/ui/enter';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { SectionDivider } from '../../components/ui/SectionDivider';
import { MapPanel } from '../../components/ui/MapPanel';
import { MapMarkerData } from '../../components/ui/MapPanel.types';
import { useMosques } from '../../hooks/useMosques';
import { SG_CENTER } from '../../services/places';
import { Colors, Fonts, Radius, Shadow } from '../../constants/theme';

const W = Dimensions.get('window').width;

type PlaceType = 'Masjid' | 'Musholla';
type Filter = 'All' | PlaceType;



export default function MasjidScreen() {
  const [filter, setFilter] = useState<Filter>('All');
  const [query, setQuery] = useState('');
  const { data: mosques, loading, error } = useMosques();

  const filtered = mosques.filter((m) => {
    const matchesFilter = filter === 'All' || m.type === filter;
    const matchesQuery =
      query.trim() === '' ||
      m.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const filters: Filter[] = ['All', 'Masjid', 'Musholla'];

  const markers: MapMarkerData[] = filtered.map((m) => ({
    id: m.id,
    lat: m.coordinates.lat,
    lng: m.coordinates.lng,
    color: m.type === 'Masjid' ? Colors.brand : Colors.blue,
    label: m.name,
  }));

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
              {mosques.length || ''} places nearby · Asar Jemaah 4:30 PM
            </Text>
          }
        >
          {/* Map preview — full-bleed, last child of the header */}
          <View
            style={{
              marginTop: 18,
              marginHorizontal: 16,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              position: 'relative',
            }}
          >
            <MapPanel
              markers={markers}
              center={SG_CENTER}
              height={144}
              zoom={14}
              rounded="top"
            />
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
                ...Shadow.cardSubtle,
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
            {loading && (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator color={Colors.brand} />
                <Text
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: 13,
                    color: Colors.muted,
                    marginTop: 10,
                  }}
                >
                  Finding mosques near you…
                </Text>
              </View>
            )}
            {!loading && filtered.length === 0 && (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ fontSize: 32, marginBottom: 12 }}>🕌</Text>
                <Text
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: 14,
                    color: Colors.muted,
                    textAlign: 'center',
                  }}
                >
                  {error ? 'Could not load places.' : 'No places found.'}
                </Text>
              </View>
            )}
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
