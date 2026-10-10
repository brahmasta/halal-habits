import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { authEnabled, supabase } from '@/lib/supabase';
import { Provider, displayName, signInWithAppleNative, signInWithProvider, signOut as doSignOut, appleNativeAvailable } from '@/lib/auth';
import { useApp } from './app';

interface AuthValue {
  enabled: boolean;
  loading: boolean;
  busy: boolean;
  user: User | null;
  session: Session | null;
  error: string | null;
  appleNative: boolean;
  signIn: (provider: Provider) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { dispatch } = useApp();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(authEnabled);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appleNative, setAppleNative] = useState(false);

  useEffect(() => {
    appleNativeAvailable().then(setAppleNative);
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Keep the greeting in sync with the signed-in account.
  useEffect(() => {
    const name = displayName(session?.user);
    if (name) dispatch({ type: 'name', name });
  }, [session?.user?.id, dispatch]);

  const signIn = useCallback(
    async (provider: Provider) => {
      setBusy(true);
      setError(null);
      const res = provider === 'apple' && appleNative ? await signInWithAppleNative() : await signInWithProvider(provider);
      setBusy(false);
      if (res.error) {
        setError(res.error);
        return false;
      }
      return true;
    },
    [appleNative]
  );

  const signOut = useCallback(async () => {
    await doSignOut();
    setSession(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ enabled: authEnabled, loading, busy, user: session?.user ?? null, session, error, appleNative, signIn, signOut, clearError: () => setError(null) }),
    [loading, busy, session, error, appleNative, signIn, signOut]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}
