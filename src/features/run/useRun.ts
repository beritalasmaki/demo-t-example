import { useCallback, useEffect, useState } from 'react'
import { getRun, NotFoundError } from '../../lib/api'
import type { GetRunOptions } from '../../lib/api'
import type { Run } from '../../lib/types'

/**
 * Loading, error and not-found handling around `lib/api`'s `getRun` — see
 * `src/features/run/README.md`. There is no stale-while-revalidating state here:
 * `getRun` has nothing like `submitDecision`'s `DecisionConflictError` to signal that a run
 * moved on during a read, so nothing models that yet. `refetch` exists for the "Retry" action
 * on a failed load (Content rules, "Empty and error states").
 */
export type RunLoadState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error'; error: Error }
  | { status: 'success'; run: Run }

export interface UseRunResult {
  state: RunLoadState
  refetch: () => void
}

export function useRun(runId: string, options: GetRunOptions = {}): UseRunResult {
  // Destructured to plain values rather than depending on `options` itself below: callers
  // (stories, tests) routinely pass a fresh object literal each render, which would otherwise
  // re-trigger the fetch every render regardless of whether anything meaningful changed.
  const { delayMs, simulateNetworkError } = options
  const [state, setState] = useState<RunLoadState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  // Reset to loading as soon as a new request starts, rather than from inside the effect
  // below. This is React's own documented pattern for "adjusting state when a prop changes"
  // (react.dev, "You Might Not Need an Effect"): setState during render itself, guarded by a
  // second piece of state holding the previous key, so it fires exactly once per new
  // runId/attempt rather than looping. A ref can't do this guarding — react-hooks flags
  // reading or writing a ref during render — because a ref's mutation isn't itself a signal
  // React re-renders on.
  const requestKey = `${runId}:${attempt}`
  const [handledKey, setHandledKey] = useState(requestKey)
  if (handledKey !== requestKey) {
    setHandledKey(requestKey)
    setState({ status: 'loading' })
  }

  useEffect(() => {
    let cancelled = false

    getRun(runId, { delayMs, simulateNetworkError })
      .then((run) => {
        if (!cancelled) setState({ status: 'success', run })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if (error instanceof NotFoundError) {
          setState({ status: 'not-found' })
        } else {
          setState({
            status: 'error',
            error: error instanceof Error ? error : new Error(String(error)),
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [runId, delayMs, simulateNetworkError, attempt])

  const refetch = useCallback(() => setAttempt((n) => n + 1), [])

  return { state, refetch }
}
