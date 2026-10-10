import { Pressable, Text, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts, SKY, SKY_ORDER, WELCOME_BG, WELCOME_INK } from '@/constants/theme';
import { Btn, Stage } from '@/components/ui/kit';
import { useNow } from '@/store/now';
import { useApp } from '@/store/app';

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { times } = useNow();
  const { dispatch } = useApp();

  const skip = () => {
    dispatch({ type: 'onboarded' });
    router.replace('/(tabs)/home');
  };

  return (
    <View style={{ flex: 1, backgroundColor: WELCOME_BG }}>
      <Stage style={{ flex: 1 }}>
        <View style={{ gap: 4, paddingTop: Math.max(insets.top, 20) + 44, paddingHorizontal: 10 }}>
          {SKY_ORDER.map((k, i) => {
            const s = SKY[k];
            const pt = times[i];
            const radius: ViewStyle =
              i === 0
                ? { borderTopLeftRadius: 34, borderTopRightRadius: 34, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }
                : i === 4
                  ? { borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomLeftRadius: 34, borderBottomRightRadius: 34 }
                  : { borderRadius: 12 };
            return (
              <View key={k} style={[{ height: 82, backgroundColor: s.bg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, marginLeft: i * 10, marginRight: (4 - i) * 10 }, radius]}>
                <Text style={{ fontFamily: Fonts.display, fontSize: 30, color: s.ink, letterSpacing: -1.05 }}>{s.name}</Text>
                <Text style={{ fontFamily: Fonts.medium, fontSize: 12.5, color: s.dim }}>
                  {s.vibe} · {pt.time} {pt.meridiem}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={{ paddingTop: 34, paddingHorizontal: 26 }}>
          <Text style={{ fontFamily: Fonts.display, fontSize: 50, color: WELCOME_INK, letterSpacing: -1.75, lineHeight: 50 * 0.95 }}>Your five,</Text>
          <Text style={{ fontFamily: Fonts.serifItalic, fontSize: 56, color: SKY.subuh.sub, lineHeight: 56 * 0.95, marginTop: 4 }}>sorted.</Text>
          <Text style={{ fontFamily: Fonts.body, fontSize: 15, color: 'rgba(243,241,236,0.66)', lineHeight: 15 * 1.5, marginTop: 14, maxWidth: 300 }}>
            Prayer times that follow the sky, the nearest musollah in any mall, and halal spots worth the trip.
          </Text>
        </View>
      </Stage>
      <View style={{ paddingHorizontal: 26, paddingBottom: Math.max(insets.bottom, 20) + 24 }}>
        <Btn kind="ghost" onPress={() => router.push('/onboarding/location')}>Get started</Btn>
        <Pressable onPress={skip} hitSlop={8} style={{ alignItems: 'center', marginTop: 16 }}>
          <Text style={{ fontFamily: Fonts.body, fontSize: 13.5, color: 'rgba(243,241,236,0.6)' }}>I have an account</Text>
        </Pressable>
      </View>
    </View>
  );
}
