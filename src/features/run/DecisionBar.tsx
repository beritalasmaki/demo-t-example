import { useEffect, useState } from 'react'
import { Checkbox } from '../../components/Checkbox'
import type { SubmitDecisionOptions } from '../../lib/api'
import { undoWindow } from '../../lib/decision'
import {
  formatDateTime,
  formatDuration,
  formatRelativeTime,
  formatSignOffMessage,
} from '../../lib/format'
import { gateAcknowledgement } from '../../lib/gates'
import type { Decision, Run } from '../../lib/types'
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
  <h2 id="decision-heading" className="text-section-heading font-semibold text-text-primary">
    Decision
  </h2>
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
      <div className="flex flex-col gap-[var(--space-3)]">
        {HEADING}
        <DecidedView decision={run.decision} />
      </div>
    )
  }

  const { failedCount, waivedCount, requiredGateIds } = gateAcknowledgement(run.gates)
  const needsAcknowledgement = requiredGateIds.length > 0
  const canApprove = !needsAcknowledgement || acknowledged

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
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
    </div>
  )
}

function DecidedView({ decision }: { decision: Decision }) {
  const [now, setNow] = useState(() => new Date())
  const undo = undoWindow(decision, now)

  useEffect(() => {
    if (!undo.active) return
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [undo.active])

  return (
    <div className="flex flex-col gap-[var(--space-2)] rounded-md border border-border-subtle bg-surface-raised p-[var(--space-4)]">
      <p className="text-item-title font-semibold font-body text-text-primary">
        <span className="font-semibold">{outcomeVerb(decision.outcome)}</span> by {decision.by} —{' '}
        {formatDateTime(decision.at)} ({formatRelativeTime(decision.at)})
      </p>
      <p className="text-meta font-normal font-body text-text-secondary">
        Revision {decision.revision}
      </p>
      {undo.active && (
        <p className="text-meta font-normal font-body text-text-secondary" aria-live="polite">
          You can undo this for {formatDuration(undo.remainingMs)} more.
        </p>
      )}
    </div>
  )
}

function outcomeVerb(outcome: Decision['outcome']): string {
  switch (outcome) {
    case 'approved':
      return 'Approved'
    case 'changes_requested':
      return 'Changes requested'
    case 'rejected':
      return 'Rejected'
  }
}
