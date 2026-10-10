import { useState } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { StepFrame } from '@/components/onboarding/StepFrame';
import { B, Chip, D, I, Ring } from '@/components/ui/kit';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/ui/ThemeContext';
import { Fonts, SKY, SKY_ORDER } from '@/constants/theme';
import { useApp } from '@/store/app';
import { useNow } from '@/store/now';

const SOUNDS = ['Adhan · Makkah', 'Adhan · soft', 'Chime', 'Silent'];

export default function RemindersStep() {
  const t = useTheme();
  const router = useRouter();
  const { state, dispatch } = useApp();
  const { times } = useNow();
  const [sound, setSound] = useState(0);
  const count = SKY_ORDER.filter((k) => state.reminders[k]).length;

  const finish = () => {
    dispatch({ type: 'onboarded' });
    router.replace('/(tabs)/home');
  };

  return (
    <StepFrame
      step={3}
      tag="Step 3 of 3 · reminders"
      title={
        <Text>
          <D size={40} lh={1}>How should we </D>
          <I size={44}>call</I>
          <D size={40} lh={1}> you?</D>
        </Text>
      }
      cta={count ? `Finish · ${count} reminders` : 'Finish without reminders'}
      ctaIcon="check"
      onNext={finish}
    >
      <View style={{ paddingTop: 26, paddingHorizontal: 24 }}>
        <B size={13} color={t.muted} style={{ marginBottom: 10 }}>Reminder sound</B>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 24 }}>
        {SOUNDS.map((s, i) => (
          <Chip key={s} label={s} on={sound === i} onPress={() => setSound(i)} />
        ))}
      </View>
      <View style={{ paddingTop: 26, paddingHorizontal: 24 }}>
        <B size={13} color={t.muted} style={{ marginBottom: 10 }}>Remind me for</B>
      </View>
      <View style={{ gap: 10, paddingHorizontal: 22 }}>
        {SKY_ORDER.map((k, i) => {
          const s = SKY[k];
          const on = state.reminders[k];
          return (
            <Ring key={k} onPress={() => dispatch({ type: 'reminder', prayer: k, on: !on })} style={{ height: 64, flexDirection: 'row', alignItems: 'center', gap: 14, paddingLeft: 20, paddingRight: 10 }}>
              <View style={{ width: 12, height: 12, borderRadius: 99, backgroundColor: s.bg, boxShadow: `0 0 0 4px ${s.bg}33` } as ViewStyle} />
              <Text style={{ fontFamily: Fonts.displayMedium, fontSize: 21, letterSpacing: -0.7, flex: 1, color: t.ink }}>{s.name}</Text>
              <B size={15} weight={500}>{times[i].time} <B size={11.5} color={t.muted}>{times[i].meridiem}</B></B>
              <View style={{ width: 44, height: 44, borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? t.brand : 'transparent', boxShadow: on ? undefined : `inset 0 0 0 1px ${t.ring}` } as ViewStyle}>
                <Icon name="bell" size={16} color={on ? t.brandInk : t.faint} />
              </View>
            </Ring>
          );
        })}
      </View>
    </StepFrame>
  );
}
