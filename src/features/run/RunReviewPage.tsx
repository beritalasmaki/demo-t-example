import { useState } from 'react'
import { Tabs, TabsContent } from '../../components/Tabs'
import type { GetRunOptions, SubmitDecisionOptions } from '../../lib/api'
import type { Run } from '../../lib/types'
import { DecisionPanel } from './DecisionPanel'
import { EvidenceTab } from './EvidenceTab'
import { RunOverview } from './RunOverview'
import { RunShape } from './RunShape'
import { RunTopBar } from './RunTopBar'
import { StepsTab } from './StepsTab'
import { StoryTimeline } from './StoryTimeline'
import { UnverifiedList } from './UnverifiedList'
import { useRun } from './useRun'

/**
 * The review page — the "story layout" (docs/DECISIONS.md, 0038). From top to bottom: the
 * page's own bar (breadcrumb and the three views), the overview (what this is, why, where it is
 * now, and what is open), then two columns. The main column holds one view at a time — Story,
 * Evidence or All steps. The right column stays in place for all three: the decision panel
 * and what is not checked before a decision; what is still unverified and the run's shape
 * after one. Below the `md` breakpoint the right column moves above the views, so the decision
 * is never at the bottom of a long page.
 *
 * Loading, not-found and error states are handled here, once. The run is held in local state
 * so a decision, a conflict or an undo updates the screen immediately, without a refetch.
 */
export type RunView = 'story' | 'evidence' | 'steps'

export interface RunReviewPageProps {
  runId: string
  /** Where the breadcrumb's "My reviews" goes. */
  reviewsHref?: string
  /** Passed straight through to `useRun`. Mainly for stories and tests. */
  getRunOptions?: GetRunOptions
  /** Passed straight through to `DecisionPanel`. Mainly for stories and tests. */
  submitDecisionOptions?: SubmitDecisionOptions
  /** Mainly for stories and tests: the view to open on. */
  defaultView?: RunView
}

export function RunReviewPage({
  runId,
  reviewsHref = '?view=reviews',
  getRunOptions,
  submitDecisionOptions,
  defaultView = 'story',
}: RunReviewPageProps) {
  const { state, refetch } = useRun(runId, getRunOptions)
  // `null` means nothing on this page has changed the loaded run yet.
  const [changedRun, setChangedRun] = useState<Run | null>(null)
  const [view, setView] = useState<RunView>(defaultView)
  const [focusEventId, setFocusEventId] = useState<string | undefined>(undefined)

  if (state.status === 'loading') {
    return (
      <p
        role="status"
        className="mx-auto max-w-6xl p-[var(--space-6)] text-body text-text-secondary"
      >
        Loading run…
      </p>
    )
  }

  if (state.status === 'not-found') {
    return (
      <p className="mx-auto max-w-6xl p-[var(--space-6)] text-body text-text-secondary">
        Could not find a run with id "{runId}".{' '}
        <a href={reviewsHref} className="text-primary underline">
          Back to my reviews
        </a>
      </p>
    )
  }

  if (state.status === 'error') {
    return (
      <p className="mx-auto max-w-6xl p-[var(--space-6)] text-body text-text-secondary">
        Could not load this run. {state.error.message}{' '}
        <button type="button" onClick={refetch} className="cursor-pointer text-primary underline">
          Retry
        </button>
      </p>
    )
  }

  const run = changedRun ?? state.run
  const decided = run.decision != null

  function showStep(eventId: string) {
    setFocusEventId(eventId)
    setView('steps')
  }

  return (
    <Tabs value={view} onValueChange={(value) => setView(value as RunView)}>
      <RunTopBar run={run} reviewsHref={reviewsHref} />
      <RunOverview run={run} onRunUpdated={setChangedRun} />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-[var(--space-6)] px-[var(--space-4)] pt-[var(--space-6)] pb-[var(--space-7)] md:grid-cols-[minmax(0,1fr)_21.25rem] md:gap-[var(--space-7)] md:px-[var(--space-6)]">
        <div className="min-w-0">
          <TabsContent value="story">
            <StoryTimeline run={run} onShowSteps={showStep} />
          </TabsContent>
          <TabsContent value="evidence">
            <EvidenceTab run={run} onOpenStep={showStep} />
          </TabsContent>
          <TabsContent value="steps">
            <StepsTab run={run} focusEventId={focusEventId} />
          </TabsContent>
        </div>

        <aside
          aria-label={decided ? 'The decision record' : 'Your decision'}
          className="order-first flex flex-col gap-[var(--space-4)] md:sticky md:top-[var(--space-5)] md:order-none"
        >
          {decided ? (
            <>
              <UnverifiedList run={run} />
              <RunShape run={run} />
            </>
          ) : (
            <>
              <DecisionPanel
                // A fresh panel after an undo: the earlier ticks and reason belonged to a
                // decision that no longer stands.
                key={run.status}
                run={run}
                onRunUpdated={setChangedRun}
                submitDecisionOptions={submitDecisionOptions}
              />
              <UnverifiedList run={run} />
            </>
          )}
        </aside>
      </div>
    </Tabs>
  )
}
