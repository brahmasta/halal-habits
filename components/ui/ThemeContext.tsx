import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { CHALK, INK, Tokens } from '@/constants/theme';
import { useApp } from '@/store/app';

export type Theme = Tokens & { islamic: boolean };
const Ctx = createContext<Theme>({ ...CHALK, islamic: true });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const { state } = useApp();
  const t = useMemo(() => {
    const pref = state.theme; // 'system' | 'light' | 'dark'
    const dark = pref === 'dark' || (pref === 'system' && system === 'dark');
    return { ...(dark ? INK : CHALK), islamic: state.style !== 'modern' };
  }, [system, state.theme, state.style]);
  return <Ctx.Provider value={t}>{children}</Ctx.Provider>;
}

export function useTheme(): Theme {
  return useContext(Ctx);
}
