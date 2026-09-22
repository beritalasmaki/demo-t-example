import {
  CheckSquare,
  FileText,
  Gauge,
  History,
  ShieldCheck,
  Target,
  TriangleAlert,
} from 'lucide-react'
import { useState } from 'react'
import { AnchorNav } from '../../components/AnchorNav'
import { buildAttentionItems } from '../../lib/attention'
import type { GetRunOptions, SubmitDecisionOptions } from '../../lib/api'
import type { Run } from '../../lib/types'
import { AttentionDigest } from './AttentionDigest'
import { ConfidencePanel } from './ConfidencePanel'
import { DecisionBar } from './DecisionBar'
import { DecisionStatusBanner } from './DecisionStatusBanner'
import { PolicyGateList } from './PolicyGateList'
import { RunHeader } from './RunHeader'
import { RunSummary } from './RunSummary'
import { Timeline } from './Timeline'
import { useRun } from './useRun'

/**
 * Composes the review screen's regions around one run: header, summary, policy gates, the
 * audit-log timeline, confidence, and the decision bar — all six regions from
 * docs/spec-review-screen.md. Two more things sit alongside them, sourced from the same
 * `run` rather than being separate regions of their own: `DecisionStatusBanner` (only when
 * already decided) and `AttentionDigest` (only when `buildAttentionItems` found something
 * worth flagging) — see docs/DECISIONS.md.
 *
 * Loading, not-found and error states are handled here, once, rather than in every region —
 * `RunHeader`, `RunSummary`, `PolicyGateList`, `Timeline`, `ConfidencePanel` and `DecisionBar`
 * all assume a real `run` exists.
 */
export interface RunReviewPageProps {
  runId: string
  /** Passed straight through to `useRun`. Mainly for stories and tests that need a fast or
   * deliberately-failing load, rather than the real artificial delay. */
  getRunOptions?: GetRunOptions
  /** Passed straight through to `DecisionBar`. Mainly for stories and tests. */
  submitDecisionOptions?: SubmitDecisionOptions
}

export function RunReviewPage({ runId, getRunOptions, submitDecisionOptions }: RunReviewPageProps) {
  const { state, refetch } = useRun(runId, getRunOptions)
  // A decision (or a conflict) updates what's on screen without a refetch — `useRun` is only
  // about the initial load, not about a change this page itself causes. `null` means "nothing
  // has overridden the loaded run yet."
  const [decidedRun, setDecidedRun] = useState<Run | null>(null)

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

  const run = decidedRun ?? state.run
  const attentionItems = buildAttentionItems(run)

  // "Needs attention" only appears once there's a digest for it to jump to — a nav link with
  // nothing to scroll to would be worse than no link at all.
  const navItems = [
    { id: 'run-header-heading', label: 'Run', icon: Target },
    ...(attentionItems.length > 0
      ? [{ id: 'needs-attention-heading', label: 'Needs attention', icon: TriangleAlert }]
      : []),
    { id: 'summary-heading', label: 'Summary', icon: FileText },
    { id: 'policy-gates-heading', label: 'Policy gates', icon: ShieldCheck },
    { id: 'audit-log-heading', label: 'Audit log', icon: History },
    { id: 'confidence-heading', label: 'Confidence', icon: Gauge },
    { id: 'decision-heading', label: 'Decision', icon: CheckSquare },
  ]

  return (
    <div className="flex items-start gap-[var(--space-5)]">
      <AnchorNav items={navItems} label="Jump to a section" />
      <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-7)]">
        <RunHeader run={run} />
        {/* Each region renders its own --text-section-heading <h2> with a fixed id, and the
         * <section> points at it via aria-labelledby rather than repeating the name in a
         * separate aria-label — one place for the name, not two. The same ids are what
         * AnchorNav's links jump to. */}
        {run.decision && <DecisionStatusBanner decision={run.decision} />}
        {attentionItems.length > 0 && (
          <section aria-labelledby="needs-attention-heading">
            <AttentionDigest items={attentionItems} />
          </section>
        )}
        <section aria-labelledby="summary-heading">
          <RunSummary summary={run.summary} timeline={run.timeline} />
        </section>
        <section aria-labelledby="policy-gates-heading">
          <PolicyGateList gates={run.gates} timeline={run.timeline} />
        </section>
        <section aria-labelledby="audit-log-heading">
          <Timeline events={run.timeline} startedAt={run.startedAt} />
        </section>
        <section aria-labelledby="confidence-heading">
          <ConfidencePanel confidence={run.confidence} />
        </section>
        <section aria-labelledby="decision-heading">
          <DecisionBar
            run={run}
            onRunUpdated={setDecidedRun}
            submitDecisionOptions={submitDecisionOptions}
          />
        </section>
      </div>
    </div>
  )
}
