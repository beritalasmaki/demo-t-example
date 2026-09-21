import type { Decision } from './types'

/**
 * Small domain helpers for Region 6 (Decision) — not UI. See src/lib/README.md.
 *
 * docs/DECISIONS.md, 0003: the undo window is a fixed policy computed from `Decision.at`, not
 * a stored field. This is the one place that policy lives, so the length is never repeated.
 */
export const UNDO_WINDOW_MINUTES = 10

export interface UndoWindow {
  active: boolean
  /** Never negative — 0 once the window has closed. */
  remainingMs: number
}

export function undoWindow(decision: Decision, now: Date = new Date()): UndoWindow {
  const decidedAtMs = new Date(decision.at).getTime()
  const remainingMs = decidedAtMs + UNDO_WINDOW_MINUTES * 60_000 - now.getTime()
  return { active: remainingMs > 0, remainingMs: Math.max(0, remainingMs) }
}
