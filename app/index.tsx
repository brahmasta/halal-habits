import { Redirect } from 'expo-router';
import { useApp } from '@/store/app';

export default function Index() {
  const { state } = useApp();
  return <Redirect href={state.onboarded ? '/(tabs)/home' : '/onboarding/welcome'} />;
}
