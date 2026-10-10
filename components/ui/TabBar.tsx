import React, { useEffect } from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '@/constants/theme';
import { useTheme } from './ThemeContext';
import { Icon, IconName } from './Icon';

const ITEMS: Array<{ name: string; label: string; icon: IconName }> = [
  { name: 'home', label: 'Home', icon: 'home' },
  { name: 'pray', label: 'Pray', icon: 'clock' },
  { name: 'find', label: 'Find', icon: 'mosque-glyph' },
  { name: 'eat', label: 'Eat', icon: 'utensils' },
  { name: 'tanya', label: 'Tanya', icon: 'msg' },
];

const EASE = Easing.bezier(0.32, 0.72, 0, 1);

function TabItem({ item, on, onPress }: { item: (typeof ITEMS)[number]; on: boolean; onPress: () => void }) {
  const t = useTheme();
  const flex = useSharedValue(on ? 1.7 : 1);
  const prog = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    flex.value = withTiming(on ? 1.7 : 1, { duration: 700, easing: EASE });
    prog.value = withTiming(on ? 1 : 0, { duration: 600, easing: EASE });
  }, [on, flex, prog]);
  const a = useAnimatedStyle(() => ({ flex: flex.value, opacity: 1 }));
  const bgStyle = useAnimatedStyle(() => ({ opacity: prog.value }));
  return (
    <Animated.View style={[{ height: 52, borderRadius: 999, overflow: 'hidden' }, a]}>
      <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: 999, backgroundColor: t.bg }, bgStyle]} />
      <Pressable onPress={onPress} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        <Icon name={item.icon} size={19} color={on ? t.ink : 'rgba(243,241,236,0.62)'} />
        {on ? <Text style={{ fontFamily: Fonts.semibold, fontSize: 13, color: t.ink }}>{item.label}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

export function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const active = ITEMS.find((i) => pathname === `/${i.name}` || pathname.startsWith(`/${i.name}/`) || pathname.startsWith(`/${i.name}-`))?.name ?? 'home';
  return (
    <View
      style={{ pointerEvents: 'box-none', position: 'absolute', left: 18, right: 18, bottom: 26 + Math.max(insets.bottom - 12, 0), height: 64, borderRadius: 999, padding: 6, flexDirection: 'row', gap: 2, backgroundColor: 'rgba(18,20,18,0.86)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 20px 40px -18px rgba(18,20,18,0.5)' } as ViewStyle}
    >
      {ITEMS.map((item) => (
        <TabItem key={item.name} item={item} on={item.name === active} onPress={() => router.navigate(`/(tabs)/${item.name}` as any)} />
      ))}
    </View>
  );
}
