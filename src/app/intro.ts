/**
 * The welcome intro's first-visit logic and timing (WelcomeIntro.tsx, docs/DECISIONS.md 0048).
 * Kept apart from the component so `App.tsx` can decide whether to show it without importing
 * the whole overlay's markup, and so the component file exports components only.
 */
export const INTRO_SEEN_KEY = 'ledger:intro-seen'

export const INTRO_TIMING = {
  draw: 900,
  resolve: 200,
  perChar: 40,
  betweenLines: 160,
  madeBy: 300,
  hold: 400,
  fade: 500,
} as const

function readSeen(): boolean {
  try {
    return window.localStorage.getItem(INTRO_SEEN_KEY) != null
  } catch {
    // Storage blocked (private mode, a sandboxed frame): treat as seen rather than show the
    // intro on every single visit.
    return true
  }
}

export function markIntroSeen() {
  try {
    window.localStorage.setItem(INTRO_SEEN_KEY, new Date().toISOString())
  } catch {
    // Nothing to do: without storage the intro simply can't remember having run.
  }
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Whether this visit should show the intro: never seen in this browser, and motion is OK. */
export function shouldShowIntro(): boolean {
  return !prefersReducedMotion() && !readSeen()
}
