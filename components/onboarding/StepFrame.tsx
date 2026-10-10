import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { B, Btn, Screen, Tag } from '@/components/ui/kit';
import { useTheme } from '@/components/ui/ThemeContext';
import { useApp } from '@/store/app';

export function StepFrame({ step, tag, title, children, cta, ctaIcon, disabled, onNext }: { step: 1 | 2 | 3; tag: string; title: React.ReactNode; children: React.ReactNode; cta: string; ctaIcon?: any; disabled?: boolean; onNext: () => void }) {
  const t = useTheme();
  const router = useRouter();
  const { dispatch } = useApp();
  const skip = () => {
    dispatch({ type: 'onboarded' });
    router.replace('/(tabs)/home');
  };
  return (
    <Screen bottom={<View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 }}><Btn onPress={onNext} disabled={disabled} icon={ctaIcon}>{cta}</Btn></View>}>
      <View style={{ paddingHorizontal: 24, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {[1, 2, 3].map((n) => (
            <View key={n} style={{ width: n === step ? 26 : 8, height: 8, borderRadius: 9, backgroundColor: n <= step ? t.ink : t.sunk }} />
          ))}
        </View>
        <Pressable onPress={skip} hitSlop={8}>
          <B size={13.5} color={t.muted}>Skip</B>
        </Pressable>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 36 }}>
        <Tag>{tag}</Tag>
        <View style={{ marginTop: 14 }}>{title}</View>
      </View>
      {children}
    </Screen>
  );
}
