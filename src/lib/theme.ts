export type Theme = "light" | "dark";

export const themeStorageKey = "mf-theme";

export function readStoredTheme(value: string | null): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

export function systemTheme(matchesDark: boolean): Theme {
  return matchesDark ? "dark" : "light";
}

