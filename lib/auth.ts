import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from './supabase';

export type Provider = 'google' | 'apple';

if (Platform.OS === 'web') WebBrowser.maybeCompleteAuthSession();

function redirectUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') return `${window.location.origin}/auth/callback`;
  return Linking.createURL('auth/callback'); // halalhabits://auth/callback
}

/**
 * OAuth via Supabase (PKCE). On web the page redirects; on native the system browser opens and
 * returns to the app via the deep link, where the code is exchanged for a session.
 */
export async function signInWithProvider(provider: Provider): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Sign-in is not configured yet.' };
  const redirectTo = redirectUrl();

  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    return error ? { error: error.message } : {};
  }

  const { data, error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo, skipBrowserRedirect: true } });
  if (error || !data.url) return { error: error?.message ?? 'Could not start sign-in.' };
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return result.type === 'cancel' || result.type === 'dismiss' ? {} : { error: 'Sign-in was interrupted.' };
  return exchangeCodeFromUrl(result.url);
}

/** Native Apple Sign-In (iOS): identity token → Supabase session. */
export async function signInWithAppleNative(): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Sign-in is not configured yet.' };
  try {
    const cred = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
    });
    if (!cred.identityToken) return { error: 'Apple did not return a token.' };
    const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: cred.identityToken });
    if (error) return { error: error.message };
    // Apple only sends the name on the first sign-in; persist it.
    const name = [cred.fullName?.givenName, cred.fullName?.familyName].filter(Boolean).join(' ');
    if (name && data.user && !data.user.user_metadata?.full_name) {
      await supabase.auth.updateUser({ data: { full_name: name } });
    }
    return {};
  } catch (e: any) {
    if (e?.code === 'ERR_REQUEST_CANCELED') return {};
    return { error: e?.message ?? 'Apple sign-in failed.' };
  }
}

export async function appleNativeAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function exchangeCodeFromUrl(url: string): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Sign-in is not configured yet.' };
  const code = new URL(url).searchParams.get('code');
  if (!code) return { error: 'No auth code in redirect.' };
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return error ? { error: error.message } : {};
}

export async function signOut() {
  await supabase?.auth.signOut();
}

/** Best display name from the auth user. */
export function displayName(user: { email?: string; user_metadata?: Record<string, any> } | null | undefined): string | null {
  if (!user) return null;
  const m = user.user_metadata ?? {};
  const full = m.full_name || m.name || [m.given_name, m.family_name].filter(Boolean).join(' ');
  if (full) return String(full).split(' ')[0];
  if (user.email) return user.email.split('@')[0];
  return null;
}
