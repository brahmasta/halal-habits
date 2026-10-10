import { Tabs } from 'expo-router';
import { TabBar } from '@/components/ui/TabBar';
import { useTheme } from '@/components/ui/ThemeContext';

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      tabBar={() => <TabBar />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: t.bg }, animation: 'fade' }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="pray" />
      <Tabs.Screen name="find" />
      <Tabs.Screen name="eat" />
      <Tabs.Screen name="tanya" />
    </Tabs>
  );
}
