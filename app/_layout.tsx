import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
} from '@expo-google-fonts/bricolage-grotesque';
import { InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif';
import { Geist_400Regular, Geist_500Medium, Geist_600SemiBold } from '@expo-google-fonts/geist';
import { GeistMono_400Regular, GeistMono_500Medium } from '@expo-google-fonts/geist-mono';
import { Amiri_400Regular } from '@expo-google-fonts/amiri';
import { CHALK } from '@/constants/theme';
import { AppProvider, useApp } from '@/store/app';
import { NowProvider } from '@/store/now';
import { ThemeProvider, useTheme } from '@/components/ui/ThemeContext';

function Shell() {
  const t = useTheme();
  const { state } = useApp();
  if (!state.hydrated) return <View style={{ flex: 1, backgroundColor: t.bg }} />;
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={t.dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg }, animation: 'fade' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding/welcome" options={{ contentStyle: { backgroundColor: '#121412' } }} />
        <Stack.Screen name="streak" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="place/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="food/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_600SemiBold,
    InstrumentSerif_400Regular_Italic,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    GeistMono_400Regular,
    GeistMono_500Medium,
    Amiri_400Regular,
  });

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: CHALK.bg }} />;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemeProvider>
          <NowProvider>
            <Shell />
          </NowProvider>
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
