import { Text, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { StepFrame } from '@/components/onboarding/StepFrame';
import { B, Bezel, D, I } from '@/components/ui/kit';
import { Icon, IconName } from '@/components/ui/Icon';
import { useTheme } from '@/components/ui/ThemeContext';
import { SKY, Sky } from '@/constants/theme';
import { useApp } from '@/store/app';

export const GOALS: Array<[string, string, IconName, Sky | null]> = [
  ['Pray on time', 'Reminders that fit your day', 'clock', SKY.zohor],
  ['Build a streak', 'Track all five, daily', 'sparkle', SKY.maghrib],
  ['Find a musollah', 'In malls, campus, CBD', 'map-pin', null],
  ['Eat halal', 'MUIS-certified spots', 'utensils', SKY.asar],
  ['Learn the deen', 'Ask Tanya, with sources', 'book', null],
  ['Pray with friends', 'Share streaks with your circle', 'heart', SKY.subuh],
];

export default function GoalsStep() {
  const t = useTheme();
  const router = useRouter();
  const { state, dispatch } = useApp();
  const on = state.goals;
  const toggle = (i: number) => dispatch({ type: 'goals', goals: on.includes(i) ? on.filter((x) => x !== i) : [...on, i] });

  return (
    <StepFrame
      step={2}
      tag="Step 2 of 3 · pick any"
      title={
        <Text>
          <D size={40} lh={1}>What should </D>
          <I size={44}>Halal Habit</I>
          <D size={40} lh={1}> help with?</D>
        </Text>
      }
      cta={on.length ? `Continue · ${on.length} picked` : 'Pick at least one'}
      disabled={!on.length}
      onNext={() => router.push('/onboarding/reminders')}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingHorizontal: 22, paddingTop: 30, paddingBottom: 20 }}>
        {GOALS.map(([g, d, ic, s], i) => {
          const sel = on.includes(i);
          const bg = sel ? (s ? s.bg : t.brand) : t.surface;
          const ink = sel ? (s ? s.ink : t.brandInk) : t.ink;
          return (
            <Bezel key={g} r={22} bg={bg} onPress={() => toggle(i)} style={{ width: '47.5%', minHeight: 128, padding: 16, justifyContent: 'space-between', flexGrow: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Icon name={ic} size={20} color={ink} />
                <View style={{ width: 22, height: 22, borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? ink : 'transparent', boxShadow: sel ? undefined : `inset 0 0 0 1.5px ${t.ring}` } as ViewStyle}>
                  {sel ? <Icon name="check" size={13} color={bg} stroke={1.8} /> : null}
                </View>
              </View>
              <View>
                <B size={15} weight={600} color={ink}>{g}</B>
                <B size={12} color={ink} lh={1.35} style={{ marginTop: 3, opacity: 0.7 }}>{d}</B>
              </View>
            </Bezel>
          );
        })}
      </View>
    </StepFrame>
  );
}
