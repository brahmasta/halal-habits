import React from 'react';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors, Fonts, Shadow } from '@/constants/theme';

const TABS = [
  { name: 'prayer', label: 'Prayer', href: '/(tabs)/prayer' },
  { name: 'masjid', label: 'Masjid', href: '/(tabs)/masjid' },
  { name: 'halal', label: 'Halal', href: '/(tabs)/halal' },
  { name: 'tanya', label: 'Tanya', href: '/(tabs)/tanya' },
];

function PrayerIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={1.7} />
      <Circle cx="11" cy="11" r="3" stroke={color} strokeWidth={1.7} />
    </Svg>
  );
}

function MasjidIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path d="M4 20h16M6 20v-8M18 20v-8M4 12 12 4 20 12M10 20v-5h4v5" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HalalIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Circle cx="11" cy="11" r="9" stroke={color} strokeWidth={1.7} />
      <Path d="M7 11l3 3 6-6" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function TanyaIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="8" cy="11" r="1" fill={color} />
      <Circle cx="12" cy="11" r="1" fill={color} />
      <Circle cx="16" cy="11" r="1" fill={color} />
    </Svg>
  );
}

const ICONS: Record<string, (props: { color: string; size: number }) => React.ReactElement> = {
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
        ...Shadow.card,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 8,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'android' ? 8 : 4,
        }}
      >
        {TABS.map((tab) => {
          const isActive =
            pathname === tab.href ||
            pathname.startsWith(`/(tabs)/${tab.name}`);
          const IconComp = ICONS[tab.name];
          const color = isActive ? Colors.jade : Colors.inkDim;

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => router.push(tab.href as any)}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 4,
              }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isActive ? Colors.jadeLight : 'transparent',
                  ...(isActive
                    ? {
                        shadowColor: Colors.jade,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.18,
                        shadowRadius: 6,
                        elevation: 3,
                      }
                    : {}),
                }}
              >
                <IconComp color={color} size={22} />
              </View>
              <Text
                style={{
                  fontFamily: isActive ? Fonts.bodySemiBold : Fonts.body,
                  fontSize: 10,
                  color,
                  marginTop: 1,
                  letterSpacing: 0.2,
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
    <Tabs
      tabBar={() => <CustomTabBar />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="prayer" options={{ title: 'Prayer' }} />
      <Tabs.Screen name="masjid" options={{ title: 'Masjid' }} />
      <Tabs.Screen name="halal" options={{ title: 'Halal' }} />
      <Tabs.Screen name="tanya" options={{ title: 'Tanya' }} />
    </Tabs>
  );
}
