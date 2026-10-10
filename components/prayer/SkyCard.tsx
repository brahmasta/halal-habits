import { useEffect, useState } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ar, B, D, DayDots, Tag } from '@/components/ui/kit';
import { Khatam, Star, useArch } from '@/components/ui/ornament';
import { bezelShadow, Fonts, SKY, SKY_ORDER } from '@/constants/theme';
import { useTheme } from '@/components/ui/ThemeContext';
import { useNow } from '@/store/now';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const BGS = SKY_ORDER.map((k) => SKY[k].bg);
const MIHRAB_H = 340;

/** Home hero. Background animates (0.9s) when the next prayer changes. */
export function SkyCard() {
  const t = useTheme();
  const { sky, idx, next, countdown } = useNow();
  const [w, setW] = useState<number | undefined>();
  const outer = useArch(MIHRAB_H, 30, w);
  const inner = useArch(MIHRAB_H - 18, 22, w ? w - 18 : undefined);
  const prog = useSharedValue(idx);
  useEffect(() => {
    prog.value = withTiming(idx, { duration: 900, easing: EASE });
  }, [idx, prog]);
  const anim = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(prog.value, [0, 1, 2, 3, 4], BGS),
  }));

  if (t.islamic) {
    return (
      <Animated.View ref={outer.ref} onLayout={(e) => setW(e.nativeEvent.layout.width)} style={[{ paddingTop: 40, paddingHorizontal: 22, paddingBottom: 22, overflow: 'hidden', alignItems: 'center', boxShadow: bezelShadow(t, true, sky.bg) } as any, outer.style, anim]}>
        <Khatam color={sky.ink} opacity={0.1} />
        <View ref={inner.ref} pointerEvents="none" style={[{ position: 'absolute', left: 9, right: 9, top: 9, bottom: 9, boxShadow: `inset 0 0 0 1px ${sky.dim}`, opacity: 0.45 } as ViewStyle, inner.style]} />
        <Star size={16} color={sky.sub} />
        <Text style={{ fontFamily: Fonts.kufi, fontSize: 40, color: sky.sub, marginTop: 8, lineHeight: 50, writingDirection: 'rtl', textAlign: 'center' }}>{sky.ar}</Text>
        <D size={62} color={sky.ink} lh={0.9} style={{ marginTop: 2, textAlign: 'center' }}>{sky.name}</D>
        <Text style={{ marginTop: 10, textAlign: 'center' }}>
          <Text style={{ fontFamily: Fonts.displayRegular, fontSize: 30, color: sky.ink, letterSpacing: -1.05 }}>{next?.time}</Text>
          <B size={14} color={sky.dim}> {next?.meridiem}</B>
        </Text>
        <View style={{ marginTop: 16 }}>
          <Tag color={sky.ink} bg="rgba(255,255,255,0.14)" ring="rgba(255,255,255,0.12)" dot={sky.sub}>Up next · {countdown}</Tag>
        </View>
        <View style={{ marginTop: 14 }}>
          <DayDots onDark={sky.onDark} />
        </View>
      </Animated.View>
    );
  }

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
