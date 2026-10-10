import { useMemo } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { B, Bezel, D, I, Photo, Round, Screen, SectionHead, Tag, Tap } from '@/components/ui/kit';
import { useTheme } from '@/components/ui/ThemeContext';
import { SkyCard } from '@/components/prayer/SkyCard';
import { Fonts, SKY, SKY_ORDER } from '@/constants/theme';
import { useApp, computeStreak, dateKey } from '@/store/app';
import { useNow } from '@/store/now';
import { useMosques } from '@/hooks/useMosques';
import { useHalalFood } from '@/hooks/useHalalFood';
import { SG_CENTER } from '@/services/places';
import { fmtDate, qiblaBearing, walkMin } from '@/lib/geo';

export default function Home() {
  const t = useTheme();
  const router = useRouter();
  const { state } = useApp();
  const { hijri, idx, offline } = useNow();
  const { data: mosques } = useMosques();
  const { data: food } = useHalalFood();

  const streak = useMemo(() => computeStreak(state.checkins), [state.checkins]);
  const musollah = mosques.find((m) => m.type === 'Musholla') ?? mosques[0];
  const pick = food.find((f) => f.certified) ?? food[0];
  const qibla = qiblaBearing(SG_CENTER);
  const showFood = state.goals.includes(3) || state.goals.length === 0;

  // 7 × 5 cells: last 7 days, one row per prayer
  const cells = useMemo(() => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(dateKey(d));
    }
    return SKY_ORDER.map((p) => days.map((k) => !!state.checkins[k]?.[p]));
  }, [state.checkins]);

  return (
    <Screen tab>
      <View style={{ paddingHorizontal: 22, paddingTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Tap onPress={() => router.push('/profile')} style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: t.brand, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: Fonts.display, fontSize: 18, color: t.brandInk }}>{state.name.charAt(0)}</Text>
        </Tap>
        <View style={{ flex: 1 }}>
          <B size={12.5} color={t.muted}>{t.islamic && hijri ? `${hijri} · ${fmtDate()}` : `${fmtDate()}${hijri ? ` · ${hijri}` : ''}`}{offline ? ' · Offline' : ''}</B>
          {t.islamic ? (
            <Text style={{ marginTop: 1 }}>
              <D size={19}>Assalamu'alaikum, </D>
              <I size={22}>{state.name}</I>
            </Text>
          ) : (
            <D size={22} style={{ marginTop: 1 }}>Salaam, {state.name}</D>
          )}
        </View>
        <Round name="bell" onPress={() => router.push('/(tabs)/pray')} />
      </View>

      <View style={{ paddingHorizontal: 22, paddingTop: 26 }}>
        <SkyCard />
      </View>

      <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 22, paddingTop: 22 }}>
        <Bezel r={24} onPress={() => router.push('/streak')} style={{ flex: 1.05, padding: 16 }}>
          <Tag>Streak</Tag>
          <D size={72} lh={0.9} style={{ marginTop: 16 }}>{streak.current}</D>
          <Text style={{ marginTop: 4 }}>
            <B size={13} color={t.muted}>days, all five </B>
            <I size={15}>on time</I>
          </Text>
          <View style={{ flex: 1, minHeight: 14 }} />
          <View style={{ gap: 4 }}>
            {cells.map((row, r) => (
              <View key={r} style={{ flexDirection: 'row', gap: 4 }}>
                {row.map((done, c) => (
                  <View key={c} style={{ flex: 1, aspectRatio: 1, borderRadius: 4, backgroundColor: done ? SKY[SKY_ORDER[r]].bg : 'transparent', boxShadow: done ? undefined : `inset 0 0 0 1px ${t.ring}` } as ViewStyle} />
                ))}
              </View>
            ))}
          </View>
        </Bezel>
        <View style={{ flex: 1, gap: 16 }}>
          <Bezel r={24} style={{ padding: 16, gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tag>Qibla</Tag>
              <View style={{ width: 30, height: 30, borderRadius: 99, boxShadow: `inset 0 0 0 1px ${t.ring}` } as ViewStyle}>
                <View style={{ position: 'absolute', left: 14, top: 4, width: 2, height: 11, backgroundColor: t.brand, borderRadius: 2, transformOrigin: '50% 11px', transform: [{ rotate: `${qibla}deg` }] }} />
              </View>
            </View>
            <D size={34} weight={500} lh={1}>{qibla}°</D>
          </Bezel>
          <Bezel r={24} bg={t.brand} onPress={() => musollah && router.push(`/place/${musollah.id}`)} style={{ padding: 16, flex: 1 }}>
            <Tag color={t.brandInk} bg="rgba(255,255,255,0.1)" ring="rgba(255,255,255,0.1)">Musollah</Tag>
            <B size={14.5} weight={600} color={t.brandInk} lh={1.25} style={{ marginTop: 12 }} numberOfLines={2}>{musollah ? musollah.name.replace(/^Musollah\s+/i, '') : 'Finding nearest…'}</B>
            <B size={12.5} color={t.brandInk} style={{ marginTop: 3, opacity: 0.7 }}>{musollah ? `${walkMin(musollah.distanceKm)} min walk` : ' '}</B>
          </Bezel>
        </View>
      </View>

      {showFood ? (
        <View>
          <SectionHead pre={idx >= 3 ? "Tonight's" : "Today's"} accent="pick" link="More spots" onLink={() => router.push('/(tabs)/eat')} style={{ paddingTop: 36, paddingBottom: 14 }} />
          <View style={{ paddingHorizontal: 22, paddingBottom: 10 }}>
            <Bezel r={26} onPress={() => pick && router.push(`/food/${encodeURIComponent(pick.id)}`)} style={{ padding: 6 }}>
              <Photo label={pick ? `${pick.emoji} ${pick.cuisine.split(' ·')[0]}` : 'Loading'} h={170} r={21} tone={t.dark ? '#2A2622' : '#EADFCC'} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 14, paddingHorizontal: 12, paddingBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <B size={16} weight={600} numberOfLines={1}>{pick?.name ?? 'Finding a spot…'}</B>
                  <B size={13} color={t.muted} style={{ marginTop: 3 }} numberOfLines={1}>{pick ? `${pick.cuisine} · ${pick.distanceKm} km` : ' '}</B>
                </View>
                {pick?.certified ? <Tag color={t.brand} bg={t.brandSoft} ring="transparent">MUIS</Tag> : null}
              </View>
            </Bezel>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}
