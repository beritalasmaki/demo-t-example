import { useEffect, useRef, useState } from 'react'
import { Modal } from '../../components/Modal'
import { DecisionConflictError, submitDecision } from '../../lib/api'
import type { SubmitDecisionOptions } from '../../lib/api'
import { UNDO_WINDOW_MINUTES } from '../../lib/decision'
import { formatDateTime, formatRelativeTime, formatRunStatusLabel } from '../../lib/format'
import type { Decision, DecisionInput, Run } from '../../lib/types'

/**
 * The confirm-or-reason modal behind each of `DecisionBar`'s three actions. See
 * docs/spec-review-screen.md, Region 6 and Content rules ("Buttons", "Empty and error
 * states") and Scenario S5.
 */
export type DecisionAction = Decision['outcome']

export type DecisionDialogState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'error'; message: string }
  | { status: 'conflict'; currentDecision: Decision }

const TITLE: Record<DecisionAction, string> = {
  approved: 'Approve and release',
  changes_requested: 'Request changes',
  rejected: 'Reject run',
}

const REASON_PROMPT: Partial<Record<DecisionAction, string>> = {
  changes_requested: 'What should change?',
  rejected: 'Why is this rejected?',
}

const ACTION_NOUN: Record<DecisionAction, string> = {
  approved: 'approval',
  changes_requested: 'request for changes',
  rejected: 'rejection',
}

export interface DecisionDialogProps {
  action: DecisionAction
  runId: string
  revision: string
  environment: Run['target']['environment']
  reviewerName: string
  /** Only meaningful for `approved` — see `lib/gates.ts`'s `gateAcknowledgement`. */
  acknowledgedGateIds: string[]
  onClose: () => void
  onDecided: (updatedRun: Run) => void
  /** Called as soon as a conflict is detected, independent of whether the dialog itself is
   * still open — so `DecisionBar` can already show the recorded decision underneath. */
  onConflict: (currentDecision: Decision) => void
  submitDecisionOptions?: SubmitDecisionOptions
  /** Mainly for stories and tests that need to render the error or conflict state directly,
   * rather than triggering it via a real submit. */
  initialState?: DecisionDialogState
  /** Mainly for stories: shows the reason field already filled in, without typing. */
  initialReason?: string
}

export function DecisionDialog({
  action,
  runId,
  revision,
  environment,
  reviewerName,
  acknowledgedGateIds,
  onClose,
  onDecided,
  onConflict,
  submitDecisionOptions,
  initialState,
  initialReason = '',
}: DecisionDialogProps) {
  const [reason, setReason] = useState(initialReason)
  const [state, setState] = useState<DecisionDialogState>(initialState ?? { status: 'idle' })
  // Confirmed against a real browser: under React's StrictMode (dev only), this effect's
  // cleanup runs once immediately after the first mount, before mounting again — with only
  // `mountedRef.current = false` in cleanup and nothing to undo it, the flag is left stuck at
  // false forever, silently discarding every real submit result. Setting it back to true in
  // the effect body itself is what actually makes it track "is this instance currently
  // mounted", not just "did a cleanup ever run."
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const reasonPrompt = REASON_PROMPT[action]
  const trimmedReason = reason.trim()
  const canSubmit =
    state.status !== 'submitting' &&
    state.status !== 'conflict' &&
    (!reasonPrompt || trimmedReason.length > 0)

  async function handleSubmit() {
    setState({ status: 'submitting' })
    const input: DecisionInput = {
      outcome: action,
      by: reviewerName,
      reason: reasonPrompt ? trimmedReason : undefined,
      acknowledgedGateIds,
      revision,
    }
    try {
      const updated = await submitDecision(runId, input, submitDecisionOptions)
      if (!mountedRef.current) return
      onDecided(updated)
    } catch (error) {
      if (!mountedRef.current) return
      if (error instanceof DecisionConflictError) {
        setState({ status: 'conflict', currentDecision: error.currentDecision })
        onConflict(error.currentDecision)
      } else {
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Something went wrong.',
        })
      }
    }
  }

  if (state.status === 'conflict') {
    return (
      <Modal title={TITLE[action]} onClose={onClose}>
        <ConflictNotice
          action={action}
          decision={state.currentDecision}
          reason={reasonPrompt ? trimmedReason : undefined}
        />
        <div className="flex justify-end">
          <CancelButton onClick={onClose}>Close</CancelButton>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title={TITLE[action]} onClose={onClose}>
      {action === 'approved' ? (
        <p className="text-sm text-text-primary">
          Release revision {revision} to {environment}? You can undo this for {UNDO_WINDOW_MINUTES}{' '}
          minutes.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <label htmlFor="decision-reason" className="text-sm font-medium text-text-primary">
            {reasonPrompt}
          </label>
          <textarea
            id="decision-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            className="rounded-md border border-border bg-surface p-2 text-sm text-text-primary"
          />
        </div>
      )}

      {state.status === 'error' && (
        <p role="alert" className="text-sm text-text-primary">
          Could not submit this decision. {state.message}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <CancelButton onClick={onClose}>Cancel</CancelButton>
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text-primary disabled:opacity-50"
        >
          {TITLE[action]}
        </button>
      </div>
    </Modal>
  )
}

function CancelButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text-primary"
    >
      {children}
    </button>
  )
}

/**
 * Scenario S5 (the lighter form — caught at the moment of deciding, not while passively
 * reading; see docs/DECISIONS.md): who decided, what, and when; the reviewer's own typed
 * reason, preserved and visible, never lost; and what they can still do.
 */
function ConflictNotice({
  action,
  decision,
  reason,
}: {
  action: DecisionAction
  decision: Decision
  reason?: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <p role="alert" className="text-sm text-text-primary">
        Someone already decided this run.
      </p>
      <p className="text-sm text-text-primary">
        <span className="font-medium">{formatRunStatusLabel(decision.outcome)}</span> by{' '}
        {decision.by} — {formatDateTime(decision.at)} ({formatRelativeTime(decision.at)}).
      </p>
      <p className="text-sm text-text-secondary">
        Your {ACTION_NOUN[action]} was not submitted and was not applied on top of theirs.
      </p>
      {reason && (
        <div>
          <p className="text-sm font-medium text-text-primary">What you had written</p>
          <p className="whitespace-pre-wrap text-sm text-text-secondary">{reason}</p>
        </div>
      )}
      <p className="text-sm text-text-secondary">
        You can read the recorded decision, or use the undo window if you still have the right to
        change it.
      </p>
    </div>
  )
}
