const THEME_KEY = "mock-exam-theme";

export type Theme = "light" | "dark";

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return "light";
}

export function setStoredTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  setStoredTheme(theme);
}

export function initTheme(): Theme {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
}
