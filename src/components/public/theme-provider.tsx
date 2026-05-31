'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const COOKIE = 'portfolio-theme';
const MAX_AGE = 60 * 60 * 24 * 365;

function persist(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE}=${theme}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
  document.documentElement.dataset.theme = theme;
}

export function ThemeProvider({ initial, children }: { initial: Theme; children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(initial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    persist(t);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      persist(next);
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

/** Pre-paint script — sets data-theme from cookie before React hydrates. */
export const themePreflightScript = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)portfolio-theme=(dark|light)/);var t=m?m[1]:'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
