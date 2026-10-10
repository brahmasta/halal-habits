import { useMemo } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { B, Bezel, D, I, Ring, Round, Screen, SectionHead, Tag, Tap } from '@/components/ui/kit';
import { useTheme } from '@/components/ui/ThemeContext';
import { Fonts, SKY, SKY_ORDER } from '@/constants/theme';
import { computeStreak, countMethodThisMonth, dateKey, useApp } from '@/store/app';

export default function Streak() {
  const t = useTheme();
  const router = useRouter();
  const { state } = useApp();
  const streak = useMemo(() => computeStreak(state.checkins), [state.checkins]);
  const jamaah = countMethodThisMonth(state.checkins, 'jamaah');

  const now = new Date();
  const month = now.toLocaleDateString('en-SG', { month: 'long' });
  const days = useMemo(() => {
    const out: string[] = [];
    for (let i = 15; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push(dateKey(d));
    }
    return out;
  }, []);
  const pct = useMemo(() => {
    let done = 0;
    let onTime = 0;
    for (const k of days) for (const p of SKY_ORDER) {
      const c = state.checkins[k]?.[p];
      if (c) { done++; if (c.onTime) onTime++; }
    }
    return done ? Math.round((onTime / done) * 100) : 0;
  }, [days, state.checkins]);

  return (
    <Screen>
      <View style={{ paddingHorizontal: 22, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Round name="back" onPress={() => router.back()} />
        <Round name="send" />
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 26 }}>
        <Tag>Your habit</Tag>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 10 }}>
          <Text style={{ fontFamily: Fonts.display, fontSize: 132, lineHeight: 132 * 0.82, letterSpacing: -0.06 * 132, color: t.ink, includeFontPadding: false }}>{streak.current}</Text>
          <View style={{ paddingBottom: 8 }}>
            <I size={28} lh={1}>days</I>
            <B size={13} color={t.muted}>all five, on time</B>
          </View>
        </View>
      </View>

      <Bezel r={26} style={{ marginHorizontal: 22, marginTop: 28, padding: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
          <B size={14} weight={600}>{month}</B>
          <B size={12.5} color={t.muted}>{pct}% on time</B>
        </View>
        <View style={{ gap: 4 }}>
          {SKY_ORDER.map((k) => (
            <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <B size={10} color={t.muted} style={{ width: 46 }}>{SKY[k].name}</B>
              {days.map((d) => {
                const done = !!state.checkins[d]?.[k];
                return <View key={d} style={{ flex: 1, aspectRatio: 1, borderRadius: 4, backgroundColor: done ? SKY[k].bg : 'transparent', boxShadow: done ? undefined : `inset 0 0 0 1px ${t.ring}` } as ViewStyle} />;
              })}
            </View>
          ))}
        </View>
      </Bezel>

      <View style={{ flexDirection: 'row', gap: 14, paddingHorizontal: 22, paddingTop: 18 }}>
        {[[String(streak.best), 'Best streak'], [String(jamaah), "Jama'ah this month"]].map(([v, l]) => (
          <Bezel key={l} r={22} style={{ flex: 1, padding: 16 }}>
            <D size={34} lh={1}>{v}</D>
            <B size={12.5} color={t.muted} style={{ marginTop: 6 }}>{l}</B>
          </Bezel>
        ))}
      </View>

      <SectionHead pre="Your" accent="circle" link="Invite" style={{ paddingTop: 34, paddingBottom: 12 }} />
      <View style={{ gap: 10, paddingHorizontal: 22, paddingBottom: 30 }}>
        {state.circle.map((f) => {
          const s = SKY[f.sky];
          const nudge = f.streak < 7;
          return (
            <Ring key={f.id} style={{ height: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10 }}>
              <View style={{ width: 44, height: 44, borderRadius: 99, backgroundColor: s.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: Fonts.display, fontSize: 17, color: s.ink }}>{f.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <B size={15} weight={600}>{f.name}</B>
                <B size={12.5} color={t.muted}>{f.streak}-day streak</B>
              </View>
              <Tap style={{ height: 40, paddingHorizontal: 16, borderRadius: 999, justifyContent: 'center', backgroundColor: nudge ? t.ink : 'transparent', boxShadow: nudge ? undefined : `inset 0 0 0 1px ${t.ring}` } as ViewStyle}>
                <B size={13} weight={600} color={nudge ? t.bg : t.ink}>{nudge ? 'Nudge' : 'Cheer'}</B>
              </Tap>
            </Ring>
          );
        })}
      </View>
    </Screen>
  );
}
