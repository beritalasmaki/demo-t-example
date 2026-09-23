import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Tabs, TabsContent } from '../../components/Tabs'
import type { GetRunOptions, SubmitDecisionOptions } from '../../lib/api'
import type { Run } from '../../lib/types'
import { DecisionPanel } from './DecisionPanel'
import { EvidenceTab } from './EvidenceTab'
import { OpenItemsBox } from './OpenItemsBox'
import { RunDetails } from './RunDetails'
import { RunOverview } from './RunOverview'
import { RunShape } from './RunShape'
import { RunTopBar } from './RunTopBar'
import { StepsTab } from './StepsTab'
import { StoryTimeline } from './StoryTimeline'
import { UndoBox } from './UndoBox'
import { UnverifiedList } from './UnverifiedList'
import { useRun } from './useRun'

/**
 * The review page — the "story layout" (docs/DECISIONS.md, 0038, and 0046 for the columns).
 * Under the page's own bar (breadcrumb and the three views), three columns: *Run details*
 * on the left; the overview card and one view at a time — Story, Evidence or All steps — in the
 * middle; on the right, what is open, the decision panel and what is not checked before a
 * decision, or the undo window, what is still unverified and the run's shape after one. The
 * side columns stay the same for all three views.
 *
 * Loading, not-found and error states are handled here, once. The run is held in local state
 * so a decision, a conflict or an undo updates the screen immediately, without a refetch.
 *
 * Switching views (docs/DECISIONS.md, 0044): the top bar is sticky; choosing a tab moves focus
 * to the chosen view's heading, scrolling it into view when it is not already near the top —
 * so the change is visible, and a screen reader hears where it landed. The tabs use manual activation: arrow keys move along the tab list,
 * Enter, Space or a click selects.
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
  // Set when the reviewer picks a tab, read once after the new view has rendered.
  const focusViewHeading = useRef(false)
  const barRef = useRef<HTMLDivElement>(null)
  const [barHeight, setBarHeight] = useState<number | undefined>(undefined)

  // The sticky bar's height — it wraps to two rows on narrow screens — so scrolled-to headings
  // and the sticky "Run details" column sit below it rather than under it.
  const loaded = state.status === 'success'
  useEffect(() => {
    const bar = barRef.current
    if (!bar || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => setBarHeight(bar.offsetHeight))
    observer.observe(bar)
    return () => observer.disconnect()
  }, [loaded])

  useEffect(() => {
    if (!focusViewHeading.current) return
    focusViewHeading.current = false
    // One frame later: Radix selects a tab on mousedown, and the browser's own default then
    // focuses that tab — focusing the heading any sooner would be undone. The new panel has
    // also mounted by then.
    const frame = requestAnimationFrame(() => {
      const heading = document.getElementById(`${view}-heading`)
      if (!heading) return
      heading.focus({ preventScroll: true })
      const top = heading.getBoundingClientRect().top
      const barBottom = barRef.current?.getBoundingClientRect().bottom ?? 0
      if (top < barBottom || top > window.innerHeight / 2)
        heading.scrollIntoView({ block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [view])

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

  function chooseView(next: RunView) {
    focusViewHeading.current = true
    setView(next)
  }

  // A link into one step: `StepsTab` focuses that row itself, not the heading.
  function showStep(eventId: string) {
    setFocusEventId(eventId)
    setView('steps')
  }

  const barStyle =
    barHeight == null ? undefined : ({ '--run-bar-height': `${barHeight}px` } as CSSProperties)

  return (
    <Tabs
      value={view}
      onValueChange={(value) => chooseView(value as RunView)}
      activationMode="manual"
    >
      <div style={barStyle}>
        <RunTopBar ref={barRef} run={run} reviewsHref={reviewsHref} />

        {/*
         * Three columns from xl up (docs/DECISIONS.md, 0046): run details | overview + view |
         * decision. Two from md: the details sit under the overview. One column below md, in
         * the order overview, decision, details, view — so the decision is never at the bottom
         * of a long page. The last row takes any spare height, so a short view never pushes a
         * gap in under the overview.
         */}
        <div className="mx-auto grid max-w-[90rem] grid-cols-1 items-start gap-[var(--space-5)] px-[var(--space-4)] pt-[var(--space-5)] pb-[var(--space-7)] md:grid-cols-[minmax(0,1fr)_21.25rem] md:grid-rows-[auto_auto_1fr] md:px-[var(--space-6)] xl:grid-cols-[17.5rem_minmax(0,1fr)_21.25rem] xl:grid-rows-[auto_1fr]">
          <div className="min-w-0 md:col-start-1 md:row-start-1 xl:col-start-2">
            <RunOverview run={run} />
          </div>

          <aside
            aria-label={decided ? 'The decision record' : 'Your decision'}
            className="flex min-w-0 flex-col gap-[var(--space-4)] md:col-start-2 md:row-span-3 md:row-start-1 xl:col-start-3 xl:row-span-2"
          >
            {decided ? (
              <>
                <UndoBox run={run} onRunUpdated={setChangedRun} />
                <UnverifiedList run={run} />
                <RunShape run={run} />
              </>
            ) : (
              <>
                <OpenItemsBox run={run} />
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

          <div className="min-w-0 md:col-start-1 md:row-start-2 xl:sticky xl:top-[calc(var(--run-bar-height,4rem)+var(--space-4))] xl:row-span-2 xl:row-start-1">
            <RunDetails run={run} />
          </div>

          <div className="min-w-0 pt-[var(--space-2)] md:col-start-1 md:row-start-3 xl:col-start-2 xl:row-start-2">
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
        </div>
      </div>
    </Tabs>
  )
}
