import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ar, B, D, DayDots, Tag } from '@/components/ui/kit';
import { bezelShadow, Fonts, SKY, SKY_ORDER } from '@/constants/theme';
import { useTheme } from '@/components/ui/ThemeContext';
import { useNow } from '@/store/now';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const BGS = SKY_ORDER.map((k) => SKY[k].bg);

/** Home hero. Background animates (0.9s) when the next prayer changes. */
export function SkyCard() {
  const t = useTheme();
  const { sky, idx, next, countdown } = useNow();
  const prog = useSharedValue(idx);
  useEffect(() => {
    prog.value = withTiming(idx, { duration: 900, easing: EASE });
  }, [idx, prog]);
  const anim = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(prog.value, [0, 1, 2, 3, 4], BGS),
  }));

  return (
    <Animated.View style={[{ borderRadius: 30, paddingHorizontal: 22, paddingTop: 22, paddingBottom: 20, overflow: 'hidden', boxShadow: bezelShadow(t, true, sky.bg) } as any, anim]}>
      <View pointerEvents="none" style={{ position: 'absolute', right: -60, top: -70, width: 220, height: 220, borderRadius: 999, backgroundColor: sky.sub, opacity: 0.22 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tag color={sky.ink} bg="rgba(255,255,255,0.14)" ring="rgba(255,255,255,0.12)" dot={sky.ink}>Up next · {countdown}</Tag>
        <Ar size={20} color={sky.dim}>{sky.ar}</Ar>
      </View>
      <D size={76} color={sky.ink} lh={0.88} style={{ marginTop: 26 }}>{sky.name}</D>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14 }}>
        <Text>
          <Text style={{ fontFamily: Fonts.displayRegular, fontSize: 34, color: sky.ink, letterSpacing: -1.2 }}>{next?.time}</Text>
          <B size={15} color={sky.dim}> {next?.meridiem}</B>
        </Text>
        <DayDots onDark={sky.onDark} />
      </View>
    </Animated.View>
  );
}
