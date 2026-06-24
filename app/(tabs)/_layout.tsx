import React from 'react';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Colors, Fonts } from '@/constants/theme';

const TABS = [
  { name: 'prayer', label: 'Prayer', href: '/(tabs)/prayer' },
  { name: 'masjid', label: 'Masjid', href: '/(tabs)/masjid' },
  { name: 'halal', label: 'Halal', href: '/(tabs)/halal' },
  { name: 'tanya', label: 'Tanya', href: '/(tabs)/tanya' },
];

type IconProps = { color: string; fill: string };

function PrayerIcon({ color, fill }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.5 2 6 5 6 8c0 4 6 12 6 12s6-8 6-12c0-3-2.5-6-6-6z"
        stroke={color}
        strokeWidth={1.7}
        fill={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="8.5" r="2" stroke={color} strokeWidth={1.7} fill="none" />
    </Svg>
  );
}

function MasjidIcon({ color, fill }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="10" rx="1.5" stroke={color} strokeWidth={1.7} fill={fill} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 11V9a5 5 0 0110 0v2" stroke={color} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 3.5v2.5" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

function HalalIcon({ color, fill }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.7} fill={fill} />
      <Path d="M7.5 12l3 3 6-6" stroke={color} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function TanyaIcon({ color, fill }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C7 3 3 6.58 3 11c0 2.5 1.2 4.8 3.1 6.3V21l3.8-2.7c.68.12 1.38.18 2.1.18 5 0 9-3.58 9-8s-4-8-9-8z"
        stroke={color}
        strokeWidth={1.7}
        fill={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="8.5" cy="11" r="1" fill={color} />
      <Circle cx="12" cy="11" r="1" fill={color} />
      <Circle cx="15.5" cy="11" r="1" fill={color} />
    </Svg>
  );
}

const ICONS: Record<string, (p: IconProps) => React.ReactElement> = {
  prayer: PrayerIcon,
  masjid: MasjidIcon,
  halal: HalalIcon,
  tanya: TanyaIcon,
};

function CustomTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SafeAreaView
      edges={['bottom']}
      style={{
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', paddingHorizontal: 8, paddingTop: 10, paddingBottom: 6 }}>
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`/(tabs)/${tab.name}`) || pathname === `/${tab.name}`;
          const Icon = ICONS[tab.name];
          const color = isActive ? Colors.brand : Colors.muted;
          const fill = isActive ? 'rgba(11,122,79,0.12)' : 'none';

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => router.push(tab.href as any)}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 7, paddingHorizontal: 4, gap: 4 }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isActive ? Colors.brandTint : 'transparent',
                  ...(isActive
                    ? {
                        borderWidth: 1.5,
                        borderColor: 'rgba(11,122,79,0.3)',
                        shadowColor: Colors.brand,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 4,
                      }
                    : {}),
                }}
              >
                <Icon color={color} fill={fill} />
              </View>
              <Text
                style={{
                  fontFamily: isActive ? Fonts.extrabold : Fonts.semibold,
                  fontSize: 11,
                  color,
                  letterSpacing: -0.1,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={() => <CustomTabBar />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="prayer" options={{ title: 'Prayer' }} />
      <Tabs.Screen name="masjid" options={{ title: 'Masjid' }} />
      <Tabs.Screen name="halal" options={{ title: 'Halal' }} />
      <Tabs.Screen name="tanya" options={{ title: 'Tanya' }} />
    </Tabs>
  );
}
