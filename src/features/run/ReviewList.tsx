import { useEffect, useState } from 'react'
import { LoadingState } from '../../components/LoadingState'
import { listRuns } from '../../lib/api'
import type { GetRunOptions, RunListItem } from '../../lib/api'
import { formatRunStatusLabel } from '../../lib/format'

/**
 * "My reviews" — where the breadcrumb goes back to. A minimal list for navigation only
 * (docs/spec-review-screen.md, Out of scope: no filtering, search or statistics). In a real
 * deployment this list belongs to the host platform; it is here so the breadcrumb leads
 * somewhere real.
 */
export interface ReviewListProps {
  runHref: (id: string) => string
  options?: GetRunOptions
}

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; runs: RunListItem[] }

export function ReviewList({ runHref, options }: ReviewListProps) {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  const delayMs = options?.delayMs
  const simulateNetworkError = options?.simulateNetworkError

  useEffect(() => {
    let active = true
    listRuns({ delayMs, simulateNetworkError })
      .then((runs) => active && setState({ status: 'success', runs }))
      .catch(
        (error: unknown) =>
          active &&
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Something went wrong.',
          }),
      )
    return () => {
      active = false
    }
  }, [delayMs, simulateNetworkError, attempt])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-[var(--space-5)] px-[var(--space-4)] py-[var(--space-6)] md:px-[var(--space-6)]">
      <h1 className="text-page-title leading-tight font-bold font-heading text-text-primary">
        My reviews
      </h1>
      {state.status === 'loading' && (
        <LoadingState label="Loading reviews…" className="min-h-[40vh]" />
      )}
      {state.status === 'error' && (
        <p className="text-body text-text-secondary">
          Could not load your reviews. {state.message}{' '}
          <button
            type="button"
            onClick={() => {
              setState({ status: 'loading' })
              setAttempt((n) => n + 1)
            }}
            className="cursor-pointer text-primary underline"
          >
            Retry
          </button>
        </p>
      )}
      {state.status === 'success' &&
        (state.runs.length === 0 ? (
          <p className="text-body text-text-secondary">No reviews are waiting for you.</p>
        ) : (
          <ul className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
            {state.runs.map((run) => (
              <li key={run.id} className="border-b border-border-subtle last:border-b-0">
                <a
                  href={runHref(run.id)}
                  className="flex flex-col gap-[var(--space-1)] px-[var(--space-4)] py-[var(--space-3)] no-underline hover:bg-bg"
                >
                  <span className="text-item-title font-semibold font-body text-text-primary">
                    {run.initiative}
                  </span>
                  <span className="text-meta font-normal font-body text-text-secondary">
                    {formatRunStatusLabel(run.status)} · {run.target.system} ·{' '}
                    {run.target.environment} · requested by {run.requestedBy} ·{' '}
                    <span className="font-mono">{run.id}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ))}
    </div>
  )
}
