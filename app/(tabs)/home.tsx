import { useMemo, useState } from 'react';
import { Text, useWindowDimensions, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { B, Bezel, D, I, Photo, Round, Screen, Tag, Tap } from '@/components/ui/kit';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/ui/ThemeContext';
import { SkyCard } from '@/components/prayer/SkyCard';
import { Fonts, SKY, SKY_ORDER } from '@/constants/theme';
import { useApp, computeStreak, dateKey } from '@/store/app';
import { useNow } from '@/store/now';
import { useMosques } from '@/hooks/useMosques';
import { useHalalFood } from '@/hooks/useHalalFood';
import { fmtDate, walkMin } from '@/lib/geo';

export default function Home() {
  const t = useTheme();
  const router = useRouter();
  const { height } = useWindowDimensions();
  const { state } = useApp();
  const { hijri, idx, offline } = useNow();
  const { data: mosques } = useMosques();
  const { data: food } = useHalalFood();

  const streak = useMemo(() => computeStreak(state.checkins), [state.checkins]);
  const musollah = mosques.find((m) => m.type === 'Musholla') ?? mosques[0];
  const pick = food.find((f) => f.certified) ?? food[0];
  const showFood = state.goals.includes(3) || state.goals.length === 0;
  // Home fits in one screen (no scroll); shorter phones get the compact hero.
  const compact = height < 820;
  const gap = compact ? 12 : 16;

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

  const dateLine = t.islamic && hijri ? `${hijri} · ${fmtDate()}` : `${fmtDate()}${hijri ? ` · ${hijri}` : ''}`;

  return (
    <Screen tab scroll={false} topGap={8} contentStyle={{ paddingBottom: 124 }}>
      <View style={{ paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Tap onPress={() => router.push('/profile')} style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: t.brand, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: Fonts.display, fontSize: 18, color: t.brandInk }}>{state.name.charAt(0)}</Text>
        </Tap>
        <View style={{ flex: 1 }}>
          <B size={12.5} color={t.muted} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{dateLine}{offline ? ' · Offline' : ''}</B>
          {t.islamic ? (
            <Text style={{ marginTop: 1 }} numberOfLines={1}>
              <D size={19}>Assalamu'alaikum, </D>
              <I size={22}>{state.name}</I>
            </Text>
          ) : (
            <D size={22} style={{ marginTop: 1 }} numberOfLines={1}>Salaam, {state.name}</D>
          )}
        </View>
        <Round name="bell" onPress={() => router.push('/(tabs)/pray')} />
      </View>

      <View style={{ paddingHorizontal: 22, paddingTop: gap + 4 }}>
        <SkyCard compact={compact} />
      </View>

      <View style={{ flex: 1, flexDirection: 'row', gap, paddingHorizontal: 22, paddingTop: gap }}>
        <Bezel r={24} onPress={() => router.push('/streak')} style={{ flex: 1.05, padding: 16 }}>
          <Tag>Streak</Tag>
          <D size={compact ? 56 : 72} lh={0.9} style={{ marginTop: compact ? 10 : 16 }}>{streak.current}</D>
          <Text style={{ marginTop: 4 }} numberOfLines={1}>
            <B size={13} color={t.muted}>days, all five </B>
            <I size={15}>on time</I>
          </Text>
          <StreakGrid cells={cells} ring={t.ring} />
        </Bezel>
        <Bezel r={24} bg={t.brand} onPress={() => musollah && router.push(`/place/${musollah.id}`)} style={{ flex: 1, padding: 16 }}>
          <Tag color={t.brandInk} bg="rgba(255,255,255,0.1)" ring="rgba(255,255,255,0.1)">Musollah</Tag>
          <B size={compact ? 16 : 18} weight={600} color={t.brandInk} lh={1.25} style={{ marginTop: 12 }} numberOfLines={3}>{musollah ? musollah.name.replace(/^Musollah\s+/i, '') : 'Finding nearest…'}</B>
          <B size={12.5} color={t.brandInk} style={{ marginTop: 4, opacity: 0.7 }}>{musollah ? `${walkMin(musollah.distanceKm)} min walk` : ' '}</B>
          <View style={{ flex: 1 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <B size={13} weight={600} color={t.brandInk}>Directions</B>
            <Icon name="arrow" size={14} color={t.brandInk} />
          </View>
        </Bezel>
      </View>

      {showFood ? (
        <View style={{ paddingHorizontal: 22, paddingTop: gap }}>
          <Bezel r={22} onPress={() => pick && router.push(`/food/${encodeURIComponent(pick.id)}`)} style={{ padding: 6, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Photo label={pick?.emoji ?? ''} h={compact ? 52 : 60} w={compact ? 52 : 60} r={16} tone={t.dark ? '#2A2622' : '#EADFCC'} />
            <View style={{ flex: 1 }}>
              <B size={11} color={t.muted} numberOfLines={1}>{idx >= 3 ? "Tonight's pick" : "Today's pick"}</B>
              <B size={15} weight={600} numberOfLines={1} style={{ marginTop: 2 }}>{pick?.name ?? 'Finding a spot…'}</B>
              <B size={12.5} color={t.muted} style={{ marginTop: 2 }} numberOfLines={1}>{pick ? `${pick.cuisine.split(' ·')[0]} · ${pick.distanceKm} km` : ' '}</B>
            </View>
            {pick?.certified ? <Tag color={t.brand} bg={t.brandSoft} ring="transparent" style={{ marginRight: 8 }}>MUIS</Tag> : null}
          </Bezel>
        </View>
      ) : null}
    </Screen>
  );
}

/** 7 × 5 check-in grid that sizes its square cells to whatever space the card has left. */
function StreakGrid({ cells, ring }: { cells: boolean[][]; ring: string }) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const GAP = 4;
  const size = box.w ? Math.max(6, Math.min((box.w - GAP * 6) / 7, (box.h - GAP * 4) / 5)) : 0;
  return (
    <View style={{ flex: 1, minHeight: 50, marginTop: 10, justifyContent: 'flex-end' }} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {size ? (
        <View style={{ gap: GAP }}>
          {cells.map((row, r) => (
            <View key={r} style={{ flexDirection: 'row', gap: GAP }}>
              {row.map((done, c) => (
                <View key={c} style={{ width: size, height: size, borderRadius: Math.min(4, size / 4), backgroundColor: done ? SKY[SKY_ORDER[r]].bg : 'transparent', boxShadow: done ? undefined : `inset 0 0 0 1px ${ring}` } as ViewStyle} />
              ))}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
