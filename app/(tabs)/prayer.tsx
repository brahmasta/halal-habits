import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import { enter } from '../../components/ui/enter';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PillToggle } from '../../components/ui/PillToggle';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';
import { Colors, Fonts, Gradients, Radius, Shadow } from '../../constants/theme';

const PRAYER_SHORT = ['SUB', 'ZOH', 'ASR', 'MAG', 'ISY'];

// Sunnah prayers — presentation metadata keyed by name. Streak values live in
// component state below (preserved logging behaviour).
const SUNNAH_PRAYERS = [
  {
    name: 'Tahajjud',
    sub: 'Last third of night',
    streak: 3,
    accent: Colors.purple,
    tint: Colors.purpleTint,
    glyph: '✦',
  },
  {
    name: 'Duha',
    sub: 'After sunrise',
    streak: 7,
    accent: Colors.brand,
    tint: Colors.brandTint,
    glyph: '◎',
  },
  {
    name: 'Rawatib',
    sub: 'With each prayer',
    streak: 12,
    accent: Colors.blue,
    tint: Colors.blueTint,
    glyph: '◈',
  },
  {
    name: 'Witr',
    sub: 'Before sleep',
    streak: 5,
    accent: Colors.orange,
    tint: Colors.orangeTint,
    glyph: '◐',
  },
];

export default function PrayerScreen() {
  const { prayers, hijriDate, loading, error, nextIdx } = usePrayerTimes();
  const [tab, setTab] = useState<0 | 1>(0);

  // Sunnah tracker: per-prayer streak + whether it's been logged today.
  const [sunnah, setSunnah] = useState(() =>
    SUNNAH_PRAYERS.map((s) => ({ streak: s.streak, loggedToday: false }))
  );

  const logSunnah = (i: number) => {
    setSunnah((prev) =>
      prev.map((s, idx) =>
        idx === i
          ? s.loggedToday
            ? { streak: Math.max(0, s.streak - 1), loggedToday: false }
            : { streak: s.streak + 1, loggedToday: true }
          : s
      )
    );
  };

  const now = new Date();
  const weekday = now.toLocaleDateString('en-SG', { weekday: 'long' });
  const dayMonthYear = now.toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const nextPrayer = prayers[nextIdx];
  const upcoming = prayers[nextIdx + 1];

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
          eyebrow={hijriDate || 'Loading...'}
          title={`${weekday}\n${dayMonthYear}`}
          titleSize={26}
          subtitle={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: Colors.brandBright,
                }}
              />
              <Text
                style={{
                  fontFamily: Fonts.medium,
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                {nextPrayer && nextPrayer.countdown
                  ? `Singapore · ${nextPrayer.name} in ${nextPrayer.countdown}`
                  : 'Singapore · Prayer Times'}
              </Text>
            </View>
          }
          right={
            <Svg viewBox="0 0 36 36" width={38} height={38}>
              <Path
                d="M28 18.5A12 12 0 1115.5 6 9 9 0 0028 18.5z"
                fill="rgba(255,255,255,0.9)"
              />
              <Path
                d="M25 8l.6 2L27.5 11l-2 .6L25 13.5l-.6-2L22.5 11l2-.4z"
                fill="#FFBF57"
              />
            </Svg>
          }
          glows={[
            {
              color: 'rgba(11,122,79,0.28)',
              size: 300,
              stop: 0.65,
              pos: { top: -90, right: -70 },
            },
            {
              color: 'rgba(146,31,255,0.22)',
              size: 220,
              stop: 0.7,
              pos: { bottom: -50, left: -30 },
            },
          ]}
        >
          {/* (a) Progress bars — one column per prayer */}
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 22,
              marginTop: 22,
              gap: 5,
            }}
          >
            {PRAYER_SHORT.map((short, i) => {
              const isDone = i < nextIdx;
              const isNext = i === nextIdx;
              return (
                <View
                  key={short}
                  style={{ flex: 1, alignItems: 'center', gap: 5 }}
                >
                  <View
                    style={{
                      height: 3,
                      width: '100%',
                      borderRadius: 99,
                      backgroundColor: isDone
                        ? 'rgba(255,255,255,0.9)'
                        : isNext
                          ? '#25D092'
                          : 'rgba(255,255,255,0.16)',
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: Fonts.bold,
                      fontSize: 9.5,
                      color: isDone
                        ? 'rgba(255,255,255,0.8)'
                        : isNext
                          ? '#5FE0AE'
                          : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {short}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* (b) Hero next-prayer card — flush at header bottom */}
          {nextPrayer && (
            <View style={{ marginTop: 18, marginHorizontal: 16 }}>
              <LinearGradient
                colors={Gradients.hero}
                locations={Gradients.heroLocations}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  paddingTop: 20,
                  paddingHorizontal: 22,
                  paddingBottom: 28,
                  ...Shadow.greenGlow,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Left */}
                  <View>
                    <Text
                      style={{
                        fontFamily: Fonts.extrabold,
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.8)',
                        letterSpacing: 1.8,
                        textTransform: 'uppercase',
                        marginBottom: 8,
                      }}
                    >
                      Next Prayer
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'baseline',
                        gap: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: Fonts.extrabold,
                          fontSize: 54,
                          letterSpacing: -2,
                          color: Colors.white,
                        }}
                      >
                        {nextPrayer.time}
                      </Text>
                      <Text
                        style={{
                          fontFamily: Fonts.semibold,
                          fontSize: 18,
                          color: 'rgba(255,255,255,0.75)',
                        }}
                      >
                        {nextPrayer.meridiem}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: Fonts.bold,
                          fontSize: 17,
                          color: Colors.white,
                        }}
                      >
                        {nextPrayer.name}
                      </Text>
                      <Text
                        style={{
                          fontFamily: Fonts.regular,
                          fontSize: 13,
                          color: 'rgba(255,255,255,0.7)',
                        }}
                      >
                        · {nextPrayer.arabic}
                      </Text>
                    </View>
                  </View>

                  {/* Right */}
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={{
                        fontFamily: Fonts.bold,
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.65)',
                        letterSpacing: 1,
                      }}
                    >
                      UPCOMING
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.extrabold,
                        fontSize: 26,
                        color: Colors.white,
                        marginTop: 4,
                      }}
                    >
                      {upcoming ? upcoming.time : ''}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.regular,
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.75)',
                        marginTop: 3,
                      }}
                    >
                      {upcoming ? upcoming.name : ''}
                    </Text>
                  </View>
                </View>

                {/* Footer */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 16,
                    paddingTop: 14,
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(255,255,255,0.22)',
                  }}
                >
                  <Svg viewBox="0 0 24 24" width={15} height={15}>
                    <Path
                      d="M12 2s5 4 5 9a5 5 0 01-10 0c0-1.5.5-2.5.5-2.5S9 11 9 13a3 3 0 003-3c0-3-2-5 0-8z"
                      fill="#fff"
                    />
                  </Svg>
                  <Text
                    style={{
                      fontFamily: Fonts.semibold,
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.85)',
                    }}
                  >
                    14-day streak ·
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.extrabold,
                      fontSize: 13,
                      color: Colors.white,
                    }}
                  >
                    {nextIdx} of 5 done today
                  </Text>
                </View>
              </LinearGradient>
            </View>
          )}
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
          <View style={{ marginBottom: 22 }}>
            <PillToggle
              options={['Fardhu Prayer', 'Sunnah Prayer']}
              value={tab}
              onChange={setTab}
            />
          </View>

          {loading && (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator color={Colors.brand} />
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  color: Colors.muted,
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
                padding: 14,
                backgroundColor: Colors.orangeTint,
                borderRadius: Radius.card,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.medium,
                  color: Colors.orange,
                  fontSize: 13,
                }}
              >
                Could not load prayer times. Please check your connection.
              </Text>
            </View>
          )}

          {/* Fardhu prayer list */}
          {tab === 0 && (
            <View style={{ gap: 9 }}>
              {prayers.map((prayer, i) => {
                const isNext = i === nextIdx;
                const isDone = i < nextIdx;
                const timeColor =
                  isNext || isDone ? Colors.brand : Colors.heading;
                return (
                  <Animated.View key={prayer.key} entering={enter(i * 50, 350)}>
                    <View
                      style={{
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: isNext
                          ? 'rgba(11,122,79,0.28)'
                          : Colors.border,
                        backgroundColor: isNext ? Colors.brandTint : Colors.white,
                        paddingVertical: 15,
                        paddingHorizontal: 18,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 14,
                        ...(isNext ? Shadow.greenGlow : Shadow.card),
                      }}
                    >
                      {/* Left: time */}
                      <View style={{ width: 64, alignItems: 'center' }}>
                        <Text
                          style={{
                            fontFamily: Fonts.extrabold,
                            fontSize: 26,
                            letterSpacing: -0.8,
                            color: timeColor,
                          }}
                        >
                          {prayer.time}
                        </Text>
                        <Text
                          style={{
                            fontFamily: Fonts.bold,
                            fontSize: 10,
                            marginTop: 3,
                            color: isNext ? Colors.brand : Colors.dim,
                          }}
                        >
                          {prayer.meridiem}
                        </Text>
                      </View>

                      {/* Separator */}
                      <View
                        style={{
                          width: 1,
                          height: 38,
                          backgroundColor: isNext
                            ? 'rgba(11,122,79,0.2)'
                            : Colors.border,
                        }}
                      />

                      {/* Centre */}
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: Fonts.bold,
                              fontSize: 15,
                              color: Colors.heading,
                            }}
                          >
                            {prayer.name}
                          </Text>
                          <Text
                            style={{
                              fontFamily: Fonts.regular,
                              fontSize: 11,
                              color: isNext ? Colors.brand : Colors.dim,
                            }}
                          >
                            {prayer.arabic}
                          </Text>
                          {isNext && (
                            <View
                              style={{
                                paddingVertical: 3,
                                paddingHorizontal: 9,
                                borderRadius: Radius.pill,
                                backgroundColor: Colors.brand,
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: Fonts.bold,
                                  fontSize: 10,
                                  color: Colors.white,
                                }}
                              >
                                NOW
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={{
                            fontFamily: Fonts.regular,
                            fontSize: 11.5,
                            color: isNext ? Colors.brand : Colors.dim,
                            marginTop: 4,
                          }}
                        >
                          {getSunnahSuggestion(prayer.key)}
                        </Text>
                      </View>

                      {/* Right: status circle */}
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isDone
                            ? Colors.brandBright
                            : Colors.pillTrack,
                          borderWidth: isDone ? 0 : 1,
                          borderColor: Colors.border,
                        }}
                      >
                        {isDone && (
                          <Svg viewBox="0 0 12 12" width={11} height={11}>
                            <Path
                              d="M2 6l3 3 5-5"
                              stroke="#fff"
                              strokeWidth={2.2}
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </Svg>
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
            <View>
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 13,
                  color: Colors.muted,
                  lineHeight: 13 * 1.7,
                  marginBottom: 8,
                }}
              >
                Voluntary prayers that draw you closer. Begin with one, let it
                become beloved.
              </Text>
              <View style={{ gap: 9 }}>
                {SUNNAH_PRAYERS.map((s, i) => (
                  <Animated.View key={s.name} entering={enter(i * 50, 350)}>
                    <View
                      style={{
                        borderRadius: 18,
                        backgroundColor: Colors.white,
                        borderWidth: 1,
                        borderColor: Colors.border,
                        paddingVertical: 16,
                        paddingHorizontal: 18,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 14,
                        ...Shadow.card,
                      }}
                    >
                      {/* Left: glyph tile */}
                      <View
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 14,
                          backgroundColor: s.tint,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.semibold,
                            fontSize: 20,
                            color: s.accent,
                          }}
                        >
                          {s.glyph}
                        </Text>
                      </View>

                      {/* Centre */}
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: Fonts.bold,
                            fontSize: 15,
                            color: Colors.heading,
                          }}
                        >
                          {s.name}
                        </Text>
                        <Text
                          style={{
                            fontFamily: Fonts.regular,
                            fontSize: 12,
                            color: Colors.muted,
                            marginTop: 3,
                          }}
                        >
                          {s.sub}
                        </Text>
                      </View>

                      {/* Right: streak + Log */}
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text
                          style={{
                            fontFamily: Fonts.extrabold,
                            fontSize: 13,
                            color: s.accent,
                          }}
                        >
                          {sunnah[i].streak}d streak
                        </Text>
                        <TouchableOpacity
                          onPress={() => logSunnah(i)}
                          activeOpacity={0.8}
                          style={{
                            marginTop: 8,
                            backgroundColor: s.tint,
                            borderRadius: 10,
                            paddingVertical: 6,
                            paddingHorizontal: 16,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: Fonts.bold,
                              fontSize: 12,
                              color: s.accent,
                            }}
                          >
                            {sunnah[i].loggedToday ? '✓ Done' : 'Log'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </View>
          )}
        </View>
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
