import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import { enter } from '../../components/ui/enter';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { SectionDivider } from '../../components/ui/SectionDivider';
import { HALAL_PLACES } from '../../services/muis';
import { Colors, Fonts, Gradients, Radius, Shadow } from '../../constants/theme';

const CUISINES = [
  '🍛 Malay',
  '🍛 Indian Muslim',
  '🍢 Hawker',
  '☕ Café',
  '🍜 Noodles',
  '🥩 BBQ',
];

// Map a display pill label to the substring(s) used to match a place's cuisine.
const CUISINE_MATCH: Record<string, string[]> = {
  '🍛 Malay': ['Malay', 'Nasi'],
  '🍛 Indian Muslim': ['Indian', 'Biryani'],
  '🍢 Hawker': ['Hawker'],
  '☕ Café': ['Café'],
  '🍜 Noodles': ['Noodle'],
  '🥩 BBQ': ['BBQ'],
};

function SearchIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24">
      <Circle cx={11} cy={11} r={8} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
      <Path
        d="m21 21-4.35-4.35"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CameraIcon({ size = 20, stroke = '#fff', strokeWidth = 1.7, r = 3.2 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 8a2 2 0 012-2h1.5l1-1.5h5l1 1.5H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <Circle cx={12} cy={12.5} r={r} stroke={stroke} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export default function HalalScreen() {
  const [search, setSearch] = useState('');
  const [activeCuisine, setActiveCuisine] = useState<string | null>(null);

  const filtered = HALAL_PLACES.filter((p) => {
    const matchSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.cuisine.toLowerCase().includes(search.toLowerCase()) ||
      p.district.toLowerCase().includes(search.toLowerCase());
    const matchCuisine =
      activeCuisine === null ||
      (CUISINE_MATCH[activeCuisine] ?? []).some((needle) =>
        p.cuisine.toLowerCase().includes(needle.toLowerCase())
      );
    return matchSearch && matchCuisine;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <ScreenHeader
          eyebrow="✦ MUIS Certified Data"
          eyebrowColor={Colors.goldEyebrow}
          title={'Halal\nFood Finder'}
          titleSize={32}
          subtitle={
            <Text
              style={{
                fontFamily: Fonts.medium,
                fontSize: 13,
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              Verified restaurants near Singapore CBD
            </Text>
          }
          glows={[
            {
              color: 'rgba(255,108,10,0.3)',
              size: 260,
              stop: 0.65,
              pos: { top: -80, right: -60 },
            },
            {
              color: 'rgba(11,122,79,0.2)',
              size: 200,
              stop: 0.7,
              pos: { bottom: -40, left: -20 },
            },
          ]}
        >
          {/* Embedded glass search row (full-bleed) */}
          <View style={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 26 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {/* Glass search field */}
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.14)',
                  borderRadius: 14,
                  paddingVertical: 13,
                  paddingHorizontal: 16,
                }}
              >
                <SearchIcon />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Restaurant or cuisine…"
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  style={{
                    flex: 1,
                    fontFamily: Fonts.regular,
                    fontSize: 14,
                    color: Colors.white,
                    padding: 0,
                  }}
                />
              </View>
              {/* Camera button */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.16)',
                  borderRadius: 14,
                  paddingHorizontal: 15,
                  justifyContent: 'center',
                }}
              >
                <CameraIcon size={20} stroke="#fff" strokeWidth={1.7} r={3.2} />
              </TouchableOpacity>
            </View>
          </View>
        </ScreenHeader>

        {/* Content area */}
        <View
          style={{
            backgroundColor: Colors.bg,
            paddingTop: 16,
            paddingHorizontal: 16,
            paddingBottom: 100,
          }}
        >
          {/* Scanner CTA — most prominent */}
          <TouchableOpacity activeOpacity={0.9}>
            <LinearGradient
              colors={Gradients.scanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 20,
                paddingVertical: 18,
                paddingHorizontal: 20,
                marginBottom: 18,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                ...Shadow.greenGlow,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CameraIcon size={26} stroke="#fff" strokeWidth={1.8} r={3.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: Fonts.extrabold,
                    fontSize: 15,
                    color: Colors.white,
                  }}
                >
                  Scan ingredient label
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.85)',
                    marginTop: 3,
                    lineHeight: 18,
                  }}
                >
                  Tanya checks halal/haram from any food label instantly
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: 12,
                  paddingVertical: 11,
                  paddingHorizontal: 18,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.extrabold,
                    fontSize: 13,
                    color: Colors.brand,
                  }}
                >
                  Scan
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Cuisine category pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
          >
            {CUISINES.map((c) => {
              const active = activeCuisine === c;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setActiveCuisine(active ? null : c)}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: active ? Colors.brand : Colors.white,
                    borderWidth: 1,
                    borderColor: active ? Colors.brand : Colors.border,
                    borderRadius: Radius.pill,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.semibold,
                      fontSize: 13,
                      color: active ? Colors.white : Colors.body,
                    }}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <SectionDivider />

          {/* Restaurant list */}
          <View style={{ gap: 9 }}>
            {filtered.map((place, i) => (
              <Animated.View key={place.id} entering={enter(i * 50, 350)}>
                <TouchableOpacity activeOpacity={0.85}>
                  <View
                    style={{
                      backgroundColor: Colors.white,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      borderRadius: 18,
                      paddingVertical: 16,
                      paddingHorizontal: 18,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 14,
                      ...Shadow.card,
                    }}
                  >
                    {/* Emoji tile */}
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 16,
                        backgroundColor: Colors.halalTile,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 26 }}>{place.emoji}</Text>
                    </View>

                    {/* Center info */}
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 4,
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
                        {place.tag && (
                          <View
                            style={{
                              paddingVertical: 3,
                              paddingHorizontal: 9,
                              borderRadius: Radius.pill,
                              backgroundColor: Colors.brandTint,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: Fonts.bold,
                                fontSize: 10,
                                color: Colors.brand,
                              }}
                            >
                              {place.tag}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text
                        style={{
                          fontFamily: Fonts.regular,
                          fontSize: 12,
                          color: Colors.muted,
                          marginBottom: 7,
                        }}
                      >
                        {place.cuisine}
                      </Text>

                      {/* Meta row */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 14,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.extrabold,
                            fontSize: 12,
                            color: Colors.brand,
                          }}
                        >
                          ✦ MUIS
                        </Text>
                        <Text
                          style={{
                            fontFamily: Fonts.bold,
                            fontSize: 12,
                            color: Colors.goldText,
                          }}
                        >
                          ★ {place.rating}
                        </Text>
                        <Text
                          style={{
                            fontFamily: Fonts.regular,
                            fontSize: 12,
                            color: Colors.muted,
                          }}
                        >
                          {place.distanceKm} km
                        </Text>
                      </View>
                    </View>

                    {/* Chevron button */}
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
                      <Text style={{ fontSize: 18, color: Colors.dim }}>›</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}

            {filtered.length === 0 && (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ fontSize: 32, marginBottom: 12 }}>🔍</Text>
                <Text
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: 14,
                    color: Colors.muted,
                    textAlign: 'center',
                  }}
                >
                  No results for "{search}"
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: 12,
                    color: Colors.dim,
                    marginTop: 4,
                    textAlign: 'center',
                  }}
                >
                  Try a different search term or cuisine filter
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
