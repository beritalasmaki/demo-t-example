import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '../lib/utils'
import { currentTheme, setTheme, systemTheme } from './theme'
import type { Theme } from './theme'

/**
 * Light or dark, chosen by the viewer (docs/DECISIONS.md, 0063). Until they choose, the page
 * follows the system setting; the choice then sets `data-theme` on <html>, which the tokens
 * already honour, and is remembered in this browser. index.html applies a remembered choice
 * before the first paint, so the page never flashes the other theme.
 *
 * A switch, announced as "Dark theme, on/off". Knows nothing about the product.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setThemeState] = useState<Theme>(currentTheme)

  // No choice made yet: follow the system if it changes while the page is open.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const follow = () => {
      if (!document.documentElement.dataset.theme) setThemeState(systemTheme())
    }
    query.addEventListener('change', follow)
    return () => query.removeEventListener('change', follow)
  }, [])

  const dark = theme === 'dark'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark theme"
      title={dark ? 'Switch to the light theme' : 'Switch to the dark theme'}
      onClick={() => {
        const next: Theme = dark ? 'light' : 'dark'
        setTheme(next)
        setThemeState(next)
      }}
      className={cn(
        'relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center justify-between rounded-full border border-border bg-surface-raised px-[var(--space-2)]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-1/2 left-1 h-6 w-6 -translate-y-1/2 rounded-full border border-border bg-surface shadow-sm',
          'transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
          dark && 'translate-x-8',
        )}
      />
      <Sun
        aria-hidden
        className={cn('relative h-4 w-4', dark ? 'text-text-secondary' : 'text-primary')}
      />
      <Moon
        aria-hidden
        className={cn('relative h-4 w-4', dark ? 'text-primary' : 'text-text-secondary')}
      />
    </button>
  )
}
