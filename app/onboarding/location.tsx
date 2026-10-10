import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StepFrame } from '@/components/onboarding/StepFrame';
import { B, Bezel, D, I } from '@/components/ui/kit';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/ui/ThemeContext';
import { SKY } from '@/constants/theme';

const POINTS = [
  ['map-pin', 'Nearest musollah', 'In any mall, campus or the CBD'],
  ['clock', 'Exact prayer times', 'MUIS calendar for where you stand'],
  ['utensils', 'Halal spots nearby', 'Sorted by walking distance'],
] as const;

export default function LocationStep() {
  const t = useTheme();
  const router = useRouter();
  return (
    <StepFrame
      step={1}
      tag="Step 1 of 3 · location"
      title={
        <Text>
          <D size={40} lh={1}>Where are you </D>
          <I size={44}>standing?</I>
        </Text>
      }
      cta="Allow location"
      onNext={() => router.push('/onboarding/goals')}
    >
      <View style={{ paddingHorizontal: 24, paddingTop: 14 }}>
        <B size={14.5} color={t.muted} lh={1.5}>Only used while the app is open. Nothing is stored or shared.</B>
      </View>
      <View style={{ paddingHorizontal: 22, paddingTop: 30, gap: 10 }}>
        {POINTS.map(([ic, a, b], i) => (
          <Bezel key={a} r={22} bg={i === 0 ? SKY.subuh.bg : undefined} style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: i === 0 ? 'rgba(255,255,255,0.12)' : t.shell }}>
              <Icon name={ic} size={19} color={i === 0 ? SKY.subuh.ink : t.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <B size={15} weight={600} color={i === 0 ? SKY.subuh.ink : t.ink}>{a}</B>
              <B size={12.5} color={i === 0 ? SKY.subuh.dim : t.muted} style={{ marginTop: 3 }}>{b}</B>
            </View>
          </Bezel>
        ))}
      </View>
    </StepFrame>
  );
}
