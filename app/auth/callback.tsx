import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { B, Screen, Tag } from '@/components/ui/kit';
import { useTheme } from '@/components/ui/ThemeContext';
import { supabase } from '@/lib/supabase';
import { exchangeCodeFromUrl } from '@/lib/auth';
import { useApp } from '@/store/app';

/** OAuth landing route. Web: supabase-js consumes ?code= on load; native deep links land here too. */
export default function AuthCallback() {
  const t = useTheme();
  const router = useRouter();
  const { dispatch } = useApp();
  const params = useLocalSearchParams<{ code?: string; error_description?: string }>();
  const [msg, setMsg] = useState('Signing you in…');

  useEffect(() => {
    let alive = true;
    const done = () => {
      dispatch({ type: 'onboarded' });
      router.replace('/(tabs)/home');
    };
    (async () => {
      if (!supabase) return done();
      if (params.error_description) {
        setMsg(String(params.error_description));
        return;
      }
      if (Platform.OS !== 'web' && params.code) {
        const r = await exchangeCodeFromUrl(`halalhabits://auth/callback?code=${params.code}`);
        if (r.error) return alive && setMsg(r.error);
        return done();
      }
      // Web: wait for detectSessionInUrl to finish.
      for (let i = 0; i < 20; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) return done();
        await new Promise((r) => setTimeout(r, 250));
      }
      if (alive) setMsg('Could not complete sign-in. Please try again.');
    })();
    return () => {
      alive = false;
    };
  }, [params.code, params.error_description]);

  return (
    <Screen>
      <View style={{ paddingHorizontal: 24, paddingTop: 40, gap: 14 }}>
        <Tag>Halal Habit</Tag>
        <B size={15} color={t.muted}>{msg}</B>
      </View>
    </Screen>
  );
}
