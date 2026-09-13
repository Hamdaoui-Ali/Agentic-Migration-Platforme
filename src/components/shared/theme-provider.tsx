"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  useEffect,
  type ReactNode,
} from "react";

import { readStoredTheme, systemTheme, themeStorageKey, type Theme } from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

let currentTheme: Theme = "light";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((listener) => listener());
}

function getSnapshot(): Theme {
  if (typeof window === "undefined") return currentTheme;
  let stored: Theme | null = null;
  try {
    stored = readStoredTheme(window.localStorage.getItem(themeStorageKey));
  } catch {
    stored = null;
  }
  if (stored) {
    currentTheme = stored;
    return stored;
  }
  const fromSystem = systemTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
  currentTheme = fromSystem;
  return fromSystem;
}

function getServerSnapshot(): Theme {
  return "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      const system = systemTheme(event.matches);
      try {
        if (readStoredTheme(window.localStorage.getItem(themeStorageKey))) return;
      } catch {
        // Continue with the system preference when storage is unavailable.
      }
      currentTheme = system;
      applyTheme(system);
      emit();
    };
    media.addEventListener("change", onChange);
    applyTheme(theme);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    currentTheme = next;
    applyTheme(next);
    try {
      window.localStorage.setItem(themeStorageKey, next);
    } catch {
      // The preference still applies for this session when storage is blocked.
    }
    emit();
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return value;
}
