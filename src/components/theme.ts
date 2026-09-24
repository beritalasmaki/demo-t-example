/**
 * The page's theme, for `ThemeToggle` (docs/DECISIONS.md, 0063): an explicit choice is
 * `data-theme` on <html> plus a remembered value; no choice follows the system setting.
 */
export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'ledger:theme'

export function systemTheme(): Theme {
  return typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/** The theme the page shows now: an explicit choice on <html>, else the system's. */
export function currentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme
  return chosen === 'light' || chosen === 'dark' ? chosen : systemTheme()
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage can be blocked (private windows); the choice then lasts until the page reloads.
  }
}
