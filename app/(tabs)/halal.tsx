import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '../../components/ui/Card';
import { SectionDivider } from '../../components/ui/SectionDivider';
import { StarPattern } from '../../components/ui/StarPattern';
import { HALAL_PLACES } from '../../services/muis';
import { Colors, Fonts, Radius, Shadow } from '../../constants/theme';

const W = Dimensions.get('window').width;

const CUISINES = ['Malay', 'Indian Muslim', 'Hawker', 'Café', 'Noodles', 'BBQ'];

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Iconic: { bg: Colors.goldLight, text: Colors.gold },
  Popular: { bg: Colors.jadeLight, text: Colors.jade },
  'Must Try': { bg: Colors.roseLight, text: Colors.rose },
};

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const frac = rating - full;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Text
          key={i}
          style={{
            fontSize: 10,
            color:
              i < full
                ? Colors.gold
                : i === full && frac > 0
                  ? Colors.gold
                  : Colors.border,
          }}
        >
          ★
        </Text>
      ))}
      <Text
        style={{
          fontFamily: Fonts.bodyMedium,
          fontSize: 11,
          color: Colors.inkLight,
          marginLeft: 3,
        }}
      >
        {rating.toFixed(1)}
      </Text>
    </View>
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
      p.cuisine.toLowerCase().includes(activeCuisine.toLowerCase()) ||
      (activeCuisine === 'Malay' &&
        (p.cuisine.includes('Malay') || p.cuisine.includes('Nasi'))) ||
      (activeCuisine === 'Indian Muslim' &&
        (p.cuisine.includes('Indian') || p.cuisine.includes('Biryani'))) ||
      (activeCuisine === 'Hawker' && p.cuisine.includes('Hawker')) ||
      (activeCuisine === 'Café' && p.cuisine.includes('Café')) ||
      (activeCuisine === 'Noodles' && p.cuisine.includes('Noodle')) ||
      (activeCuisine === 'BBQ' && p.cuisine.includes('BBQ'));
    return matchSearch && matchCuisine;
  });

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
        {/* Header with amber warm tone */}
        <View
          style={{
            backgroundColor: Colors.gold,
            paddingHorizontal: 22,
            paddingTop: 56,
            paddingBottom: 24,
            minHeight: 220,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <StarPattern opacity={0.08} width={W} height={300} />
          <View
            style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 180,
              height: 180,
              borderRadius: 90,
              backgroundColor: 'rgba(255,255,255,0.10)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: 'rgba(184,130,42,0.18)',
            }}
          />

          <View style={{ position: 'relative', zIndex: 1 }}>
            <Text
              style={{
                fontFamily: Fonts.bodySemiBold,
                fontSize: 10.5,
                color: 'rgba(255,255,255,0.75)',
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              ✦ MUIS Certified Data
            </Text>
            <Text
              style={{
                fontFamily: Fonts.serif,
                fontSize: 30,
                color: Colors.white,
                lineHeight: 36,
                marginBottom: 4,
              }}
            >
              {'Halal\nFood Finder'}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.body,
                fontSize: 13,
                color: 'rgba(255,255,255,0.75)',
                marginBottom: 14,
              }}
            >
              Singapore MUIS certified restaurants
            </Text>

            {/* Search bar */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: Radius.lg,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.25)',
                paddingHorizontal: 14,
                paddingVertical: 10,
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 16 }}>🔍</Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search restaurants, cuisines..."
                placeholderTextColor="rgba(255,255,255,0.55)"
                style={{
                  flex: 1,
                  fontFamily: Fonts.body,
                  fontSize: 14,
                  color: Colors.white,
                  padding: 0,
                }}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Text
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 16,
                    }}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Scanner CTA */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <TouchableOpacity activeOpacity={0.85}>
            <View
              style={{
                backgroundColor: Colors.goldPale,
                borderRadius: Radius.xl,
                borderWidth: 1.5,
                borderColor: `${Colors.gold}60`,
                padding: 18,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                ...Shadow.gold,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: Radius.md,
                  backgroundColor: Colors.goldLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: `${Colors.gold}40`,
                }}
              >
                <Text style={{ fontSize: 26 }}>📷</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: Fonts.bodyBold,
                    fontSize: 15,
                    color: Colors.inkMid,
                    marginBottom: 2,
                  }}
                >
                  Scan Product Barcode
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.body,
                    fontSize: 12,
                    color: Colors.inkLight,
                  }}
                >
                  Instantly check halal status via MUIS database
                </Text>
              </View>
              <Text style={{ fontSize: 18, color: Colors.gold }}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Cuisine filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 16 }}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          <TouchableOpacity
            key="All"
            onPress={() => setActiveCuisine(null)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: Radius.pill,
              backgroundColor:
                activeCuisine === null ? Colors.gold : Colors.white,
              borderWidth: 1,
              borderColor:
                activeCuisine === null ? Colors.gold : Colors.border,
              marginRight: 4,
            }}
            activeOpacity={0.8}
          >
            <Text
              style={{
                fontFamily:
                  activeCuisine === null ? Fonts.bodySemiBold : Fonts.body,
                fontSize: 13,
                color: activeCuisine === null ? Colors.white : Colors.inkLight,
              }}
            >
              All
            </Text>
          </TouchableOpacity>
          {CUISINES.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() =>
                setActiveCuisine(activeCuisine === c ? null : c)
              }
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: Radius.pill,
                backgroundColor:
                  activeCuisine === c ? Colors.gold : Colors.white,
                borderWidth: 1,
                borderColor: activeCuisine === c ? Colors.gold : Colors.border,
                marginRight: 4,
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontFamily:
                    activeCuisine === c ? Fonts.bodySemiBold : Fonts.body,
                  fontSize: 13,
                  color: activeCuisine === c ? Colors.white : Colors.inkLight,
                }}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <SectionDivider />

        {/* Results count */}
        <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
          <Text
            style={{
              fontFamily: Fonts.bodyMedium,
              fontSize: 12,
              color: Colors.inkDim,
            }}
          >
            {filtered.length} MUIS certified places nearby
          </Text>
        </View>

        {/* Restaurant list */}
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {filtered.map((place, i) => {
            const tagStyle = place.tag ? TAG_COLORS[place.tag] : null;
            return (
              <Animated.View
                key={place.id}
                entering={FadeInDown.delay(i * 50).duration(380)}
              >
                <Card accent={Colors.gold}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={{ padding: 14 }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 12,
                      }}
                    >
                      {/* Emoji icon */}
                      <View
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: Radius.md,
                          backgroundColor: Colors.goldPale,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 1,
                          borderColor: `${Colors.gold}25`,
                        }}
                      >
                        <Text style={{ fontSize: 26 }}>{place.emoji}</Text>
                      </View>

                      {/* Info */}
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 3,
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
                          {tagStyle && (
                            <View
                              style={{
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                borderRadius: Radius.pill,
                                backgroundColor: tagStyle.bg,
                                marginLeft: 6,
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: Fonts.bodySemiBold,
                                  fontSize: 9,
                                  color: tagStyle.text,
                                  letterSpacing: 0.4,
                                }}
                              >
                                {place.tag}
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text
                          style={{
                            fontFamily: Fonts.bodyMedium,
                            fontSize: 12,
                            color: Colors.gold,
                            marginBottom: 2,
                          }}
                        >
                          {place.cuisine}
                        </Text>

                        <Text
                          style={{
                            fontFamily: Fonts.body,
                            fontSize: 11.5,
                            color: Colors.inkLight,
                            marginBottom: 6,
                          }}
                          numberOfLines={1}
                        >
                          {place.district} · {place.address}
                        </Text>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <StarRating rating={place.rating} />
                          <Text
                            style={{
                              fontFamily: Fonts.bodyMedium,
                              fontSize: 11,
                              color: Colors.inkLight,
                            }}
                          >
                            {place.distanceKm} km away
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* MUIS cert badge */}
                    <View
                      style={{
                        marginTop: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: Colors.jadePale,
                        borderRadius: Radius.sm,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        alignSelf: 'flex-start',
                        gap: 5,
                      }}
                    >
                      <Text style={{ fontSize: 12 }}>✅</Text>
                      <Text
                        style={{
                          fontFamily: Fonts.bodyMedium,
                          fontSize: 10.5,
                          color: Colors.jade,
                        }}
                      >
                        MUIS Halal · {place.muisCertNumber}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Card>
              </Animated.View>
            );
          })}

          {filtered.length === 0 && (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginBottom: 12 }}>🔍</Text>
              <Text
                style={{
                  fontFamily: Fonts.bodyMedium,
                  fontSize: 14,
                  color: Colors.inkLight,
                  textAlign: 'center',
                }}
              >
                No results for "{search}"
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.body,
                  fontSize: 12,
                  color: Colors.inkDim,
                  marginTop: 4,
                  textAlign: 'center',
                }}
              >
                Try a different search term or cuisine filter
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
