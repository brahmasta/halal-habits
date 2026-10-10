import { useState } from 'react';
import { Modal, Pressable, Text, View, ViewStyle } from 'react-native';
import Animated from "react-native-reanimated";
import { enter } from "@/components/ui/enter";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { B, Btn, Chip, D, DayDots, bezel } from '@/components/ui/kit';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/ui/ThemeContext';
import { SKY } from '@/constants/theme';
import { Method, computeStreak, dateKey, useApp } from '@/store/app';
import { PrayerTime, useNow } from '@/store/now';
import { fmtTime } from '@/lib/geo';

const METHODS: Array<[string, Method]> = [['On my own', 'own'], ["Jama'ah at masjid", 'jamaah'], ['With friends', 'friends'], ['Qada', 'qada']];

export function CheckInSheet({ prayer, onClose }: { prayer: PrayerTime | null; onClose: () => void }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useApp();
  const { times, now } = useNow();
  const [method, setMethod] = useState<Method>('jamaah');
  if (!prayer) return null;

  const s = SKY[prayer.k];
  const i = times.findIndex((p) => p.k === prayer.k);
  const nextP = times[i + 1];
  const cur = now.getHours() * 60 + now.getMinutes();
  const late = Math.max(0, cur - prayer.minutes);
  const onTime = method !== 'qada' && (!nextP || cur < nextP.minutes);
  const streak = computeStreak(state.checkins);
  const projected = streak.current + (i === times.length - 1 ? 1 : 0);

  const save = () => {
    dispatch({ type: 'checkin', date: dateKey(now), prayer: prayer.k, checkin: { at: now.toISOString(), method, onTime } });
    onClose();
  };

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <Animated.View entering={enter(0, 400)} style={{ flex: 1 }}>
        <Pressable onPress={onClose} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(18,20,18,0.42)' }} />
        <Animated.View entering={enter(0, 900)} style={{ position: 'absolute', left: 8, right: 8, bottom: Math.max(insets.bottom, 8), borderRadius: 44, backgroundColor: t.bg, padding: 8, boxShadow: '0 -20px 60px -20px rgba(0,0,0,0.4)' } as ViewStyle}>
          <View style={[bezel(t, s.bg, 36, s.bg), { paddingTop: 24, paddingHorizontal: 22, paddingBottom: 22, alignItems: 'center' }]}>
            <View style={{ width: 40, height: 5, borderRadius: 9, backgroundColor: s.onDark ? 'rgba(255,255,255,0.22)' : 'rgba(26,25,19,0.18)', marginTop: -10, marginBottom: 18 }} />
            <View style={{ width: 64, height: 64, borderRadius: 99, backgroundColor: s.ink, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={28} color={s.bg} stroke={1.6} />
            </View>
            <D size={40} color={s.ink} lh={1} style={{ marginTop: 16 }}>{s.name}, done.</D>
            <B size={14} color={s.dim} style={{ marginTop: 8 }}>
              Prayed at {fmtTime(now)}{late > 0 ? ` · ${late >= 60 ? `${Math.floor(late / 60)}h ${late % 60}m` : `${late} minute${late === 1 ? '' : 's'}`} after adhan` : ' · right on adhan'}
            </B>
          </View>
          <View style={{ paddingTop: 22, paddingHorizontal: 14, paddingBottom: 6 }}>
            <B size={13} color={t.muted} style={{ marginBottom: 10 }}>How did you pray?</B>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {METHODS.map(([label, m]) => (
                <Chip key={m} label={label} on={method === m} onPress={() => setMethod(m)} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 20, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 22, backgroundColor: t.surface, boxShadow: `0 0 0 1px ${t.ring}` } as ViewStyle}>
              <D size={34} lh={1}>{projected}</D>
              <View style={{ flex: 1 }}>
                <Text>
                  <B size={13} color={t.muted} lh={1.35}>day streak.{'\n'}{nextP ? `${nextP.sky.name} keeps it going.` : 'All five, done.'}</B>
                </Text>
              </View>
              <DayDots size={9} />
            </View>
            <Btn icon="check" onPress={save} style={{ marginTop: 16, marginBottom: 18 }}>Save</Btn>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
