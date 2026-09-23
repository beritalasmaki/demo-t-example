import { useEffect, useState } from 'react'
import { undoWindow } from '../../lib/decision'
import type { Decision } from '../../lib/types'

/**
 * Whether the undo window for `decision` is still open, updated at the moment it closes — one
 * timer set for that moment, not a per-second tick (`UndoBox` ticks for its own countdown).
 * `now` pins the clock, for stories and tests.
 */
export function useUndoActive(decision: Decision | undefined, now?: Date): boolean {
  const [, setClosedAt] = useState(0)
  const active = decision ? undoWindow(decision, now).active : false
  const remainingMs = decision ? undoWindow(decision, now).remainingMs : 0

  useEffect(() => {
    if (now || !active) return
    const timer = setTimeout(() => setClosedAt(Date.now()), remainingMs + 50)
    return () => clearTimeout(timer)
  }, [now, active, remainingMs])

  return active
}
