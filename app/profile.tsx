import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { B, Bezel, Btn, Chip, D, I, Round, Screen, Tag } from '@/components/ui/kit';
import { useTheme } from '@/components/ui/ThemeContext';
import { Fonts } from '@/constants/theme';
import { useApp } from '@/store/app';
import { useAuth } from '@/store/auth';

export default function Profile() {
  const t = useTheme();
  const router = useRouter();
  const { state, dispatch } = useApp();
  const auth = useAuth();
  const themes: Array<[string, typeof state.theme]> = [['System', 'system'], ['Chalk', 'light'], ['Ink', 'dark']];
  const styles: Array<[string, typeof state.style]> = [['Islamic', 'islamic'], ['Modern', 'modern']];

  return (
    <Screen>
      <View style={{ paddingHorizontal: 22, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Round name="back" onPress={() => router.back()} />
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 26, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 64, height: 64, borderRadius: 999, backgroundColor: t.brand, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: Fonts.display, fontSize: 26, color: t.brandInk }}>{state.name.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Tag>{auth.user ? 'Signed in' : 'Guest'}</Tag>
          <Text style={{ marginTop: 8 }}>
            <D size={30} lh={1}>{state.name}</D>
          </Text>
          {auth.user?.email ? <B size={12.5} color={t.muted} style={{ marginTop: 4 }}>{auth.user.email}</B> : null}
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 30 }}>
        <Text>
          <D size={24}>Look and </D>
          <I size={27}>feel</I>
        </Text>
      </View>
      <Bezel r={24} style={{ marginHorizontal: 22, marginTop: 14, padding: 16, gap: 14 }}>
        <View>
          <B size={13} color={t.muted} style={{ marginBottom: 10 }}>Base colour</B>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {themes.map(([label, v]) => (
              <Chip key={v} label={label} on={state.theme === v} onPress={() => dispatch({ type: 'theme', theme: v })} />
            ))}
          </View>
        </View>
        <View>
          <B size={13} color={t.muted} style={{ marginBottom: 10 }}>Character</B>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {styles.map(([label, v]) => (
              <Chip key={v} label={label} on={state.style === v} onPress={() => dispatch({ type: 'style', style: v })} />
            ))}
          </View>
        </View>
      </Bezel>

      <View style={{ paddingHorizontal: 22, paddingTop: 30, gap: 12 }}>
        {auth.user ? (
          <Btn kind="ghost" icon="back" onPress={async () => { await auth.signOut(); router.replace('/(tabs)/home'); }}>Sign out</Btn>
        ) : (
          <Btn onPress={() => router.push('/sign-in')}>Sign in to sync</Btn>
        )}
        <Btn kind="ghost" icon="sparkle" onPress={() => { dispatch({ type: 'reset' }); router.replace('/onboarding/welcome'); }}>Restart onboarding</Btn>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
        <B size={12} color={t.faint}>Halal Habit · MUIS calendar · Shafi'i</B>
      </View>
    </Screen>
  );
}
