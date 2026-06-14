'use client';
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const Ctx = createContext<ThemeCtx>({ theme: 'dark', setTheme: () => {}, toggleTheme: () => {} });

function getCookieTheme(): Theme | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/theme=([^;]+)/);
  if (match && (match[1] === 'dark' || match[1] === 'light')) return match[1] as Theme;
  return null;
}

function getStorageTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('clouddevis-theme') as Theme | null;
  if (saved === 'dark' || saved === 'light') return saved;
  return null;
}

function getInitialTheme(serverTheme?: Theme | null): Theme {
  if (serverTheme) return serverTheme;
  return getCookieTheme() ?? getStorageTheme() ?? 'dark';
}

function setThemeCookie(t: Theme) {
  document.cookie = `theme=${t}; path=/; max-age=${365 * 24 * 60 * 60}`;
}

function applyThemeToDOM(t: Theme) {
  document.documentElement.setAttribute('data-theme', t);
}

export function ThemeProvider({ children, initialTheme }: { children: ReactNode; initialTheme?: Theme }) {
  const [theme, setThemeState] = useState<Theme>(initialTheme ?? getInitialTheme);
  const [ready, setReady] = useState(false);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    setThemeCookie(t);
    localStorage.setItem('clouddevis-theme', t);
    applyThemeToDOM(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Apply theme on mount
  useEffect(() => {
    applyThemeToDOM(theme);
    // Small delay to prevent transition flash
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setReady(true));
    });
  }, [theme]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'clouddevis-theme' && (e.newValue === 'dark' || e.newValue === 'light')) {
        setThemeState(e.newValue as Theme);
        applyThemeToDOM(e.newValue as Theme);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <Ctx.Provider value={{ theme, setTheme, toggleTheme }}>
      <div data-theme-ready={ready || undefined} style={{ display: 'contents' }}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function useTheme() {
  return useContext(Ctx);
}
