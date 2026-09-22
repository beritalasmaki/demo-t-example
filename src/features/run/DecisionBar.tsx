import { CheckSquare, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Checkbox } from '../../components/Checkbox'
import { IconText } from '../../components/IconText'
import { RegionCard } from '../../components/RegionCard'
import type { SubmitDecisionOptions } from '../../lib/api'
import { undoWindow } from '../../lib/decision'
import {
  formatDateTime,
  formatDecisionOutcomeLabel,
  formatDuration,
  formatRelativeTime,
  formatSignOffMessage,
} from '../../lib/format'
import { gateAcknowledgement } from '../../lib/gates'
import type { Decision, Run } from '../../lib/types'
import { ActorName } from './ActorName'
import { DecisionDialog } from './DecisionDialog'
import type { DecisionAction } from './DecisionDialog'

/**
 * Region 6: the three actions, the sign-off tick, and — once `run.decision` exists — who
 * decided, when, and the undo window. See docs/spec-review-screen.md, Hierarchy and
 * disclosure: "First: the three actions and the acknowledgement of failed or waived gates...
 * After a decision, first: who decided, when, and the undo window counting down." The two are
 * mutually exclusive, never both on screen.
 *
 * There is no session/auth in this app (AGENTS.md, Out of scope), so `reviewerName` defaults
 * to a fixed stand-in identity — the same kind of stand-in docs/DECISIONS.md 0004 already
 * describes for `DecisionInput.by`.
 */
const DEFAULT_REVIEWER = 'Jordan Ellis'

const BUTTON_CLASSNAME =
  'rounded-md border border-border bg-surface px-[var(--space-4)] py-[var(--space-2)] text-sm font-medium text-text-primary ' +
  'hover:border-text-secondary disabled:cursor-not-allowed disabled:opacity-50'

const HEADING = (
  <>
    <h2 id="decision-heading" className="text-section-heading font-semibold text-text-primary">
      <IconText icon={CheckSquare}>Decision</IconText>
    </h2>
    <p className="text-meta font-normal font-body text-text-secondary">
      Approve, request changes, or reject — always made by the human reviewer, never by the
      agent.
    </p>
  </>
)

export interface DecisionBarProps {
  run: Run
  reviewerName?: string
  onRunUpdated: (updatedRun: Run) => void
  /** Passed straight through to `DecisionDialog`. Mainly for stories and tests. */
  submitDecisionOptions?: SubmitDecisionOptions
  /** Mainly for stories: shows the sign-off tick already ticked, without a click. */
  defaultAcknowledged?: boolean
}

export function DecisionBar({
  run,
  reviewerName = DEFAULT_REVIEWER,
  onRunUpdated,
  submitDecisionOptions,
  defaultAcknowledged = false,
}: DecisionBarProps) {
  const [openAction, setOpenAction] = useState<DecisionAction | null>(null)
  const [acknowledged, setAcknowledged] = useState(defaultAcknowledged)

  if (run.decision) {
    return (
      <RegionCard className="flex flex-col gap-[var(--space-3)]">
        {HEADING}
        <DecidedView run={run} decision={run.decision} onRunUpdated={onRunUpdated} />
      </RegionCard>
    )
  }

  const { failedCount, waivedCount, requiredGateIds } = gateAcknowledgement(run.gates)
  const needsAcknowledgement = requiredGateIds.length > 0
  const canApprove = !needsAcknowledgement || acknowledged

  return (
    <RegionCard className="flex flex-col gap-[var(--space-3)]">
      {HEADING}
      <div className="flex flex-col gap-[var(--space-2)]">
        {needsAcknowledgement && (
          <Checkbox checked={acknowledged} onCheckedChange={setAcknowledged}>
            {formatSignOffMessage(failedCount, waivedCount)}
          </Checkbox>
        )}

        <div className="flex flex-wrap gap-[var(--space-3)]">
          <button
            type="button"
            onClick={() => setOpenAction('approved')}
            disabled={!canApprove}
            className={BUTTON_CLASSNAME}
          >
            Approve and release
          </button>
          <button
            type="button"
            onClick={() => setOpenAction('changes_requested')}
            className={BUTTON_CLASSNAME}
          >
            Request changes
          </button>
          <button
            type="button"
            onClick={() => setOpenAction('rejected')}
            className={BUTTON_CLASSNAME}
          >
            Reject run
          </button>
        </div>
      </div>

      {openAction && (
        <DecisionDialog
          action={openAction}
          runId={run.id}
          revision={run.revision}
          environment={run.target.environment}
          reviewerName={reviewerName}
          acknowledgedGateIds={openAction === 'approved' ? requiredGateIds : []}
          onClose={() => setOpenAction(null)}
          onDecided={(updatedRun) => {
            onRunUpdated(updatedRun)
            setOpenAction(null)
          }}
          onConflict={(currentDecision) => {
            onRunUpdated({ ...run, decision: currentDecision, status: currentDecision.outcome })
          }}
          submitDecisionOptions={submitDecisionOptions}
        />
      )}
    </RegionCard>
  )
}

/**
 * Undo is real (it does put `run.decision` back to `undefined`, on screen, immediately) but
 * local-only — there is no backend for it to reverse anything on. See docs/DECISIONS.md for
 * why that's the deliberate scope, not a shortcut. Reuses `onRunUpdated`, the exact same
 * mechanism `DecisionBar` already uses to apply a real decision or an S5 conflict — undoing
 * isn't a different kind of state change from those, just one going the other way.
 */
function DecidedView({
  run,
  decision,
  onRunUpdated,
}: {
  run: Run
  decision: Decision
  onRunUpdated: (updatedRun: Run) => void
}) {
  const [now, setNow] = useState(() => new Date())
  const undo = undoWindow(decision, now)

  useEffect(() => {
    if (!undo.active) return
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [undo.active])

  function handleUndo() {
    onRunUpdated({ ...run, decision: undefined, status: 'awaiting_review' })
  }

  return (
    <div className="flex flex-col gap-[var(--space-3)] rounded-md border border-border-subtle bg-surface-raised p-[var(--space-4)]">
      <div className="grid grid-cols-3 gap-[var(--space-3)]">
        <div className="flex flex-col gap-[var(--space-1)]">
          <span className="text-meta font-semibold font-body tracking-wide text-text-secondary uppercase">
            {formatDecisionOutcomeLabel(decision.outcome)} by
          </span>
          <ActorName name={decision.by} />
        </div>
        <div className="flex flex-col gap-[var(--space-1)]">
          <span className="text-meta font-semibold font-body tracking-wide text-text-secondary uppercase">
            Time
          </span>
          <span className="text-body font-normal font-body text-text-primary">
            {formatDateTime(decision.at)} ({formatRelativeTime(decision.at)})
          </span>
        </div>
        <div className="flex flex-col gap-[var(--space-1)]">
          <span className="text-meta font-semibold font-body tracking-wide text-text-secondary uppercase">
            Revision
          </span>
          <span className="text-body font-normal font-body text-text-primary">
            {decision.revision}
          </span>
        </div>
      </div>

      <hr className="border-border-subtle" />

      {undo.active ? (
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          {/* The one filled, non-neutral button in this whole feature — Scenario S2's "no
           * brand colour on any of the three actions" is deliberately scoped to those three;
           * Undo is a different, later action, and this neutral dark/light inversion (no
           * --color-primary) gives it enough visual weight to be found quickly on an
           * already-decided card without introducing a brand colour anywhere. */}
          <button
            type="button"
            onClick={handleUndo}
            className="inline-flex items-center gap-[var(--space-2)] rounded-md bg-text-primary px-[var(--space-4)] py-[var(--space-2)] text-sm font-medium text-surface hover:opacity-90"
          >
            <RotateCcw aria-hidden className="h-4 w-4" />
            Undo
          </button>
          <p className="text-meta font-normal font-body text-text-secondary" aria-live="polite">
            You can undo this for {formatDuration(undo.remainingMs)} more.
          </p>
        </div>
      ) : (
        <p className="text-meta font-normal font-body text-text-secondary">
          The undo window for this decision has closed.
        </p>
      )}
    </div>
  )
}
