import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { CHALK, INK, Tokens } from '@/constants/theme';
import { useApp } from '@/store/app';

const Ctx = createContext<Tokens>(CHALK);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const { state } = useApp();
  const t = useMemo(() => {
    const pref = state.theme; // 'system' | 'light' | 'dark'
    const dark = pref === 'dark' || (pref === 'system' && system === 'dark');
    return dark ? INK : CHALK;
  }, [system, state.theme]);
  return <Ctx.Provider value={t}>{children}</Ctx.Provider>;
}

export function useTheme(): Tokens {
  return useContext(Ctx);
}
