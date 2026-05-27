import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PillToggle } from '../../components/ui/PillToggle';
import { Card } from '../../components/ui/Card';
import { SectionDivider } from '../../components/ui/SectionDivider';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';
import { Colors, Fonts, Radius, Shadow } from '../../constants/theme';

const W = Dimensions.get('window').width;

const PRAYER_SHORT = ['SUB', 'ZOH', 'ASR', 'MAG', 'ISY'];

const SUNNAH_PRAYERS = [
  {
    name: 'Tahajjud',
    arabic: 'تهجد',
    time: '2:00 – 4:00 AM',
    desc: '8 rakaat + 3 Witr',
    accent: Colors.gold,
    bg: Colors.goldPale,
    border: `${Colors.gold}40`,
  },
  {
    name: 'Duha',
    arabic: 'ضحى',
    time: '7:00 – 11:00 AM',
    desc: '2–12 rakaat',
    accent: Colors.jade,
    bg: Colors.jadePale,
    border: `${Colors.jade}40`,
  },
  {
    name: 'Rawatib Subuh',
    arabic: 'رواتب',
    time: 'Before Subuh',
    desc: '2 rakaat sunnah muakkad',
    accent: Colors.sky,
    bg: Colors.skyLight,
    border: `${Colors.sky}40`,
  },
  {
    name: 'Witr',
    arabic: 'وتر',
    time: 'After Isyak',
    desc: '1–11 rakaat, end of night',
    accent: Colors.rose,
    bg: Colors.roseLight,
    border: `${Colors.rose}40`,
  },
];

export default function PrayerScreen() {
  const { prayers, hijriDate, loading, error, nextIdx } = usePrayerTimes();
  const [tab, setTab] = useState<0 | 1>(0);

  const now = new Date();
  const gregorianDate = now.toLocaleDateString('en-SG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const nextPrayer = prayers[nextIdx];

  const subtitle =
    nextPrayer && nextPrayer.countdown
      ? `Singapore · ${nextPrayer.name} in ${nextPrayer.countdown}`
      : 'Singapore · Prayer Times';

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
          background={Colors.jade}
          eyebrow={hijriDate || 'Loading...'}
          title={gregorianDate}
          subtitle={subtitle}
          height={220}
        >
          {/* Progress bars */}
          <View
            style={{
              flexDirection: 'row',
              marginTop: 16,
              gap: 4,
            }}
          >
            {PRAYER_SHORT.map((short, i) => {
              const isPast = i < nextIdx;
              const isNext = i === nextIdx;
              return (
                <View key={short} style={{ flex: 1, alignItems: 'center' }}>
                  <View
                    style={{
                      height: 3,
                      width: '100%',
                      borderRadius: Radius.pill,
                      backgroundColor: isPast
                        ? 'rgba(255,255,255,0.9)'
                        : isNext
                          ? Colors.gold
                          : 'rgba(255,255,255,0.3)',
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: Fonts.bodySemiBold,
                      fontSize: 9,
                      color: isPast
                        ? 'rgba(255,255,255,0.9)'
                        : isNext
                          ? Colors.gold
                          : 'rgba(255,255,255,0.45)',
                      marginTop: 4,
                      letterSpacing: 0.5,
                    }}
                  >
                    {short}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScreenHeader>

        {/* Hero next prayer glass card */}
        {nextPrayer && (
          <View style={{ marginTop: -30, paddingHorizontal: 16, zIndex: 10 }}>
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.92)',
                borderRadius: Radius.xl,
                borderWidth: 1,
                borderColor: Colors.border,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                ...Shadow.cardHover,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: Fonts.bodySemiBold,
                    fontSize: 10,
                    color: Colors.jade,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    marginBottom: 2,
                  }}
                >
                  Next Prayer
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.serif,
                    fontSize: 52,
                    color: Colors.ink,
                    lineHeight: 58,
                  }}
                >
                  {nextPrayer.time}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.body,
                    fontSize: 14,
                    color: Colors.inkLight,
                  }}
                >
                  {nextPrayer.meridiem} · {nextPrayer.name} ({nextPrayer.arabic})
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                {nextPrayer.countdown ? (
                  <View
                    style={{
                      backgroundColor: Colors.jadeLight,
                      borderRadius: Radius.md,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.bodyBold,
                        fontSize: 16,
                        color: Colors.jade,
                      }}
                    >
                      {nextPrayer.countdown}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.body,
                        fontSize: 10,
                        color: Colors.jadeMid,
                        textAlign: 'center',
                      }}
                    >
                      away
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        )}

        {loading && (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator color={Colors.jade} />
            <Text
              style={{
                fontFamily: Fonts.body,
                color: Colors.inkLight,
                marginTop: 8,
              }}
            >
              Loading prayer times...
            </Text>
          </View>
        )}

        {error && (
          <View
            style={{
              margin: 16,
              padding: 14,
              backgroundColor: Colors.roseLight,
              borderRadius: Radius.md,
            }}
          >
            <Text
              style={{ fontFamily: Fonts.body, color: Colors.rose, fontSize: 13 }}
            >
              Could not load prayer times. Please check your connection.
            </Text>
          </View>
        )}

        {/* Toggle */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <PillToggle
            options={['Fardhu', 'Sunnah']}
            value={tab}
            onChange={setTab}
          />
        </View>

        <SectionDivider />

        {/* Fardhu prayer list */}
        {tab === 0 && (
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            {prayers.map((prayer, i) => {
              const isNext = i === nextIdx;
              const isPast = i < nextIdx;
              return (
                <Animated.View
                  key={prayer.key}
                  entering={FadeInDown.delay(i * 60).duration(400)}
                >
                  <View
                    style={{
                      borderRadius: Radius.lg,
                      borderWidth: 1,
                      borderColor: isNext ? Colors.jade : Colors.border,
                      backgroundColor: isNext ? Colors.jade : Colors.white,
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      ...(isNext ? Shadow.jade : Shadow.card),
                    }}
                  >
                    {/* Left: time */}
                    <View style={{ minWidth: 72 }}>
                      <Text
                        style={{
                          fontFamily: Fonts.serif,
                          fontSize: 24,
                          color: isNext ? Colors.white : Colors.ink,
                          lineHeight: 28,
                        }}
                      >
                        {prayer.time}
                      </Text>
                      <Text
                        style={{
                          fontFamily: Fonts.bodyMedium,
                          fontSize: 11,
                          color: isNext
                            ? 'rgba(255,255,255,0.65)'
                            : Colors.inkDim,
                          letterSpacing: 0.5,
                        }}
                      >
                        {prayer.meridiem}
                      </Text>
                    </View>

                    {/* Centre */}
                    <View style={{ flex: 1, paddingHorizontal: 12 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.bodyBold,
                            fontSize: 15,
                            color: isNext ? Colors.white : Colors.ink,
                          }}
                        >
                          {prayer.name}
                        </Text>
                        {isNext && (
                          <View
                            style={{
                              backgroundColor: Colors.gold,
                              borderRadius: Radius.pill,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: Fonts.bodySemiBold,
                                fontSize: 9,
                                color: Colors.white,
                                letterSpacing: 0.8,
                              }}
                            >
                              NEXT
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={{
                          fontFamily: Fonts.body,
                          fontSize: 12,
                          color: isNext
                            ? 'rgba(255,255,255,0.7)'
                            : Colors.inkLight,
                        }}
                      >
                        {prayer.arabic} · {getSunnahSuggestion(prayer.key)}
                      </Text>
                    </View>

                    {/* Right: checkbox */}
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        borderWidth: 1.5,
                        borderColor: isNext
                          ? 'rgba(255,255,255,0.5)'
                          : isPast
                            ? Colors.jade
                            : Colors.border,
                        backgroundColor: isPast ? Colors.jadeLight : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isPast && (
                        <Text
                          style={{
                            color: Colors.jade,
                            fontSize: 13,
                            fontFamily: Fonts.bodyBold,
                          }}
                        >
                          ✓
                        </Text>
                      )}
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* Sunnah prayer list */}
        {tab === 1 && (
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            {SUNNAH_PRAYERS.map((s, i) => (
              <Animated.View
                key={s.name}
                entering={FadeInDown.delay(i * 70).duration(400)}
              >
                <View
                  style={{
                    borderRadius: Radius.lg,
                    borderWidth: 1,
                    borderColor: s.border,
                    backgroundColor: s.bg,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    ...Shadow.card,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: Fonts.bodyBold,
                        fontSize: 15,
                        color: s.accent,
                        marginBottom: 2,
                      }}
                    >
                      {s.name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.body,
                        fontSize: 12,
                        color: Colors.inkLight,
                        marginBottom: 2,
                      }}
                    >
                      {s.arabic}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.bodyMedium,
                        fontSize: 12,
                        color: Colors.inkMid,
                      }}
                    >
                      {s.time}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: `${s.accent}18`,
                      borderRadius: Radius.md,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.bodySemiBold,
                        fontSize: 11,
                        color: s.accent,
                        textAlign: 'center',
                      }}
                    >
                      {s.desc}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getSunnahSuggestion(key: string): string {
  const map: Record<string, string> = {
    Fajr: '2 rakaat sunnah before',
    Dhuhr: '4 before + 2 after',
    Asr: '4 rakaat sunnah before',
    Maghrib: '2 rakaat sunnah after',
    Isha: '2 rakaat sunnah after',
  };
  return map[key] ?? '';
}
