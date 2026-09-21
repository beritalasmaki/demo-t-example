import type { GetRunOptions } from '../../lib/api'
import { PolicyGateList } from './PolicyGateList'
import { RunHeader } from './RunHeader'
import { RunSummary } from './RunSummary'
import { Timeline } from './Timeline'
import { useRun } from './useRun'

/**
 * Composes the review screen's regions around one run: header, summary, policy gates, and
 * the audit-log timeline. Confidence and Decision (Regions 5 and 6) are not built yet — see
 * docs/spec-review-screen.md and src/features/run/README.md.
 *
 * Loading, not-found and error states are handled here, once, rather than in every region —
 * `RunHeader`, `RunSummary`, `PolicyGateList` and `Timeline` all assume a real `run` exists.
 */
export interface RunReviewPageProps {
  runId: string
  /** Passed straight through to `useRun`. Mainly for stories and tests that need a fast or
   * deliberately-failing load, rather than the real artificial delay. */
  getRunOptions?: GetRunOptions
}

export function RunReviewPage({ runId, getRunOptions }: RunReviewPageProps) {
  const { state, refetch } = useRun(runId, getRunOptions)

  if (state.status === 'loading') {
    return (
      <p role="status" className="text-text-secondary">
        Loading run…
      </p>
    )
  }

  if (state.status === 'not-found') {
    return <p className="text-text-secondary">Could not find a run with id "{runId}".</p>
  }

  if (state.status === 'error') {
    return (
      <p className="text-text-secondary">
        Could not load this run. {state.error.message}{' '}
        <button type="button" onClick={refetch} className="text-primary underline">
          Retry
        </button>
      </p>
    )
  }

  const { run } = state

  return (
    <div className="flex flex-col gap-8">
      <RunHeader run={run} />
      <section aria-label="Summary">
        <RunSummary summary={run.summary} timeline={run.timeline} />
      </section>
      <section aria-label="Policy gates">
        <PolicyGateList gates={run.gates} timeline={run.timeline} />
      </section>
      <section aria-label="Timeline">
        <Timeline events={run.timeline} startedAt={run.startedAt} />
      </section>
    </div>
  )
}
