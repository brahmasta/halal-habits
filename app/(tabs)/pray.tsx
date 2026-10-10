import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import { Ar, B, Bezel, D, I, Ring, Round, Screen, Tag } from '@/components/ui/kit';
import { Khatam, Star } from '@/components/ui/ornament';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/ui/ThemeContext';
import { CheckInSheet } from '@/components/prayer/CheckInSheet';
import { Fonts, SKY } from '@/constants/theme';
import { dateKey, useApp } from '@/store/app';
import { PrayerTime, useNow } from '@/store/now';
import { fmtDate } from '@/lib/geo';

function Band({ p, state, onPress, reminder, onBell }: { p: PrayerTime; state: 'done' | 'next' | 'later' | 'missed'; onPress?: () => void; reminder?: boolean; onBell?: () => void }) {
  const t = useTheme();
  const { countdown } = useNow();
  const s = SKY[p.k];
  if (state === 'next') {
    return (
      <Bezel bg={s.bg} r={28} style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 18, overflow: 'hidden' }}>
        {t.islamic ? <Khatam color={s.ink} opacity={0.1} fade="left" maskColor={s.bg} /> : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tag color={s.ink} bg="rgba(255,255,255,0.14)" ring="rgba(255,255,255,0.12)" dot={s.ink}>Next · {countdown}</Tag>
          <B size={12.5} color={s.dim}>{s.vibe}</B>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 18 }}>
          <D size={48} color={s.ink} lh={0.9}>{s.name}</D>
          <Text>
            <Text style={{ fontFamily: Fonts.displayRegular, fontSize: 34, color: s.ink, letterSpacing: -1.2 }}>{p.time}</Text>
            <B size={13} color={s.dim}> {p.meridiem}</B>
          </Text>
        </View>
        {t.islamic ? <Ar size={20} color={s.sub} style={{ marginTop: 6, alignSelf: 'flex-start' }}>{s.ar}</Ar> : null}
      </Bezel>
    );
  }
  const done = state === 'done';
  const dimText = done;
  return (
    <Ring onPress={onPress} style={{ height: 64, flexDirection: 'row', alignItems: 'center', gap: 14, paddingLeft: 20, paddingRight: 10 }}>
      {t.islamic ? <Star size={16} color={s.bg} /> : <View style={{ width: 12, height: 12, borderRadius: 99, backgroundColor: s.bg, boxShadow: `0 0 0 4px ${s.bg}33` } as ViewStyle} />}
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
        <Text style={{ fontFamily: Fonts.displayMedium, fontSize: 21, letterSpacing: -0.7, color: dimText ? t.muted : t.ink }}>{s.name}</Text>
        {t.islamic ? <Ar size={15} color={t.muted}>{s.ar}</Ar> : null}
      </View>
      <Text>
        <B size={15} weight={500} color={dimText ? t.muted : t.ink}>{p.time}</B>
        <B size={11.5} color={t.muted}> {p.meridiem}</B>
      </Text>
      {done ? (
        <View style={{ width: 44, height: 44, borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: t.brand }}>
          <Icon name="check" size={16} color={t.brandInk} />
        </View>
      ) : state === 'missed' ? (
        <View style={{ width: 44, height: 44, borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: t.ink }}>
          <Icon name="plus" size={16} color={t.bg} />
        </View>
      ) : (
        <Pressable onPress={onBell} hitSlop={6} style={{ width: 44, height: 44, borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: reminder ? t.sunk : 'transparent', boxShadow: `inset 0 0 0 1px ${t.ring}` } as ViewStyle}>
          <Icon name="bell" size={16} color={reminder ? t.ink : t.faint} />
        </Pressable>
      )}
    </Ring>
  );
}

export default function Pray() {
  const t = useTheme();
  const router = useRouter();
  const { times, idx, passed, syuruk, offline, now } = useNow();
  const { state, dispatch } = useApp();
  const [seg, setSeg] = useState(0);
  const [sheet, setSheet] = useState<PrayerTime | null>(null);
  const today = state.checkins[dateKey(now)] ?? {};
  const wrapped = passed.length === 5; // after Isyak: next is tomorrow's Subuh

  return (
    <Screen tab>
      <View style={{ paddingHorizontal: 22, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Tag>{offline ? `Offline · times from ${fmtDate()}` : `${fmtDate()} · Singapore`}</Tag>
          <Text style={{ marginTop: 14 }}>
            <D size={46} lh={1}>Today's </D>
            <I size={50}>sky</I>
          </Text>
        </View>
        <Round name="settings" onPress={() => router.push('/profile')} />
      </View>

      <View style={{ flexDirection: 'row', gap: 6, marginHorizontal: 22, marginTop: 24, padding: 5, borderRadius: 999, backgroundColor: t.shell, boxShadow: `0 0 0 1px ${t.ring}` } as ViewStyle}>
        {['Today', 'Week', 'Month'].map((x, i) => (
          <Pressable key={x} onPress={() => { setSeg(i); if (i > 0) { router.push('/streak'); setSeg(0); } }} style={{ flex: 1, height: 38, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: seg === i ? t.surface : 'transparent', boxShadow: seg === i ? `0 1px 2px rgba(18,20,18,0.08), 0 0 0 1px ${t.ring}` : undefined } as ViewStyle}>
            <B size={13.5} weight={600} color={seg === i ? t.ink : t.muted}>{x}</B>
          </Pressable>
        ))}
      </View>

      <View style={{ gap: 10, paddingHorizontal: 22, paddingTop: 24 }}>
        {times.map((p, i) => {
          const isPast = passed.includes(p.k);
          const st = today[p.k] ? 'done' : !wrapped && i === idx ? 'next' : isPast ? 'missed' : 'later';
          return (
            <View key={p.k} style={{ gap: 10 }}>
              <Band p={p} state={st} reminder={state.reminders[p.k]} onBell={() => dispatch({ type: 'reminder', prayer: p.k, on: !state.reminders[p.k] })} onPress={isPast && !today[p.k] ? () => setSheet(p) : undefined} />
              {p.k === 'subuh' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 22 }}>
                  <Icon name="sunrise" size={14} color={t.muted} />
                  <B size={12} color={t.muted}>Syuruk {syuruk} · sunrise</B>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
      <View style={{ paddingTop: 18, paddingHorizontal: 24, alignItems: 'center' }}>
        <B size={12} color={t.muted}>MUIS calendar · Shafi'i</B>
      </View>
      {sheet ? <CheckInSheet prayer={sheet} onClose={() => setSheet(null)} /> : null}
    </Screen>
  );
}
