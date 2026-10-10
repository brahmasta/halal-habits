import { Pressable, Text, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { B, D, I, Round, Screen, Tag, Tap } from '@/components/ui/kit';
import { AppleMark, GoogleMark } from '@/components/ui/BrandIcon';
import { useTheme } from '@/components/ui/ThemeContext';
import { Fonts, SKY } from '@/constants/theme';
import { useAuth } from '@/store/auth';
import { useApp } from '@/store/app';

function ProviderButton({ label, mark, onPress, disabled }: { label: string; mark: React.ReactNode; onPress: () => void; disabled?: boolean }) {
  const t = useTheme();
  return (
    <Tap onPress={onPress} disabled={disabled} style={{ height: 58, borderRadius: 999, flexDirection: 'row', alignItems: 'center', paddingLeft: 7, paddingRight: 24, backgroundColor: t.surface, boxShadow: `inset 0 1px 0 ${t.hi}, 0 0 0 1px ${t.ring}`, opacity: disabled ? 0.5 : 1 } as ViewStyle}>
      <View style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: t.shell, alignItems: 'center', justifyContent: 'center' }}>{mark}</View>
      <Text style={{ flex: 1, textAlign: 'center', fontFamily: Fonts.semibold, fontSize: 15.5, color: t.ink, marginRight: 20 }}>{label}</Text>
    </Tap>
  );
}

export default function SignIn() {
  const t = useTheme();
  const router = useRouter();
  const auth = useAuth();
  const { state, dispatch } = useApp();

  const finish = () => {
    dispatch({ type: 'onboarded' });
    router.replace('/(tabs)/home');
  };

  const go = async (p: 'apple' | 'google') => {
    const ok = await auth.signIn(p);
    // On web the page redirects away; on native we land back here with a session.
    if (ok && auth.enabled && (p === 'apple' || auth.user)) finish();
  };

  return (
    <Screen
      bottom={
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28, alignItems: 'center' }}>
          <Pressable onPress={finish} hitSlop={8}>
            <B size={13.5} color={t.muted}>Continue as guest</B>
          </Pressable>
        </View>
      }
    >
      <View style={{ paddingHorizontal: 22, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Round name="back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/onboarding/welcome'))} />
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 26 }}>
        <Tag dot={SKY.subuh.sub}>{state.onboarded ? 'Sync your streak' : 'Welcome back'}</Tag>
        <Text style={{ marginTop: 14 }}>
          <D size={44} lh={1}>Pick up where you </D>
          <I size={48}>left off.</I>
        </Text>
        <B size={14.5} color={t.muted} lh={1.5} style={{ marginTop: 14, maxWidth: 310 }}>
          Your streak, circle and saved spots follow you across devices. No passwords, no newsletters.
        </B>
      </View>
      <View style={{ paddingHorizontal: 22, paddingTop: 34, gap: 12 }}>
        <ProviderButton label="Continue with Apple" mark={<AppleMark color={t.ink} />} onPress={() => go('apple')} disabled={auth.busy} />
        <ProviderButton label="Continue with Google" mark={<GoogleMark />} onPress={() => go('google')} disabled={auth.busy} />
        {!auth.enabled ? (
          <B size={12.5} color={t.muted} lh={1.45} style={{ paddingHorizontal: 4, paddingTop: 6 }}>
            Sign-in isn't configured in this build yet. Add the Supabase keys to enable Apple and Google.
          </B>
        ) : null}
        {auth.error ? (
          <B size={12.5} color="#B6503F" lh={1.45} style={{ paddingHorizontal: 4, paddingTop: 6 }}>{auth.error}</B>
        ) : null}
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 28 }}>
        <B size={11.5} color={t.faint} lh={1.5}>By continuing you agree to keep your five. Terms and privacy apply.</B>
      </View>
    </Screen>
  );
}
