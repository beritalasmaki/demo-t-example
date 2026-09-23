import { Undo2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { undoWindow } from '../../lib/decision'
import { formatDuration } from '../../lib/format'
import type { Run } from '../../lib/types'

/**
 * The undo window after a decision, in the header where it can't be missed: a large countdown
 * and one filled button, kept apart from every other action (docs/DECISIONS.md, 0033 and 0039).
 * Undo is real but local only — it puts `run.decision` back to `undefined` on screen, with
 * nothing on a backend to reverse (0017).
 */
export interface UndoBoxProps {
  run: Run
  onRunUpdated: (updatedRun: Run) => void
  /** Mainly for stories and tests: the clock the countdown reads. */
  now?: Date
}

export function UndoBox({ run, onRunUpdated, now: fixedNow }: UndoBoxProps) {
  const [tickNow, setTickNow] = useState(() => new Date())
  const now = fixedNow ?? tickNow
  const decision = run.decision
  const undo = decision ? undoWindow(decision, now) : { active: false, remainingMs: 0 }

  useEffect(() => {
    if (fixedNow || !undo.active) return
    const interval = setInterval(() => setTickNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [fixedNow, undo.active])

  if (!decision) return null

  return (
    <div className="flex w-full flex-col gap-[var(--space-3)] rounded-lg border border-border bg-bg p-[var(--space-4)] md:w-[17.5rem]">
      {undo.active ? (
        <>
          <span className="text-meta font-semibold font-heading text-text-primary">
            Undo window open
          </span>
          <span
            className="text-score font-semibold font-heading leading-none text-text-primary tabular-nums"
            role="timer"
            aria-label={`${formatDuration(undo.remainingMs)} left to undo`}
          >
            {formatDuration(undo.remainingMs)}
          </span>
          <button
            type="button"
            onClick={() => onRunUpdated({ ...run, decision: undefined, status: 'awaiting_review' })}
            className="inline-flex cursor-pointer items-center justify-center gap-[var(--space-3)] rounded-md border border-text-primary bg-text-primary px-[var(--space-4)] py-[var(--space-3)] text-body font-semibold font-heading leading-none whitespace-nowrap text-surface hover:opacity-90"
          >
            <Undo2 aria-hidden className="h-4 w-4" />
            Undo this decision
          </button>
          <span className="text-caption font-normal font-body leading-relaxed text-text-secondary">
            {decision.outcome === 'approved'
              ? 'After that, the release can only be reversed by a new run.'
              : 'After that, the decision is final.'}
          </span>
        </>
      ) : (
        <>
          <span className="text-meta font-semibold font-heading text-text-primary">
            Undo window closed
          </span>
          <span className="text-caption font-normal font-body leading-relaxed text-text-secondary">
            {decision.outcome === 'approved'
              ? 'The release can only be reversed by a new run.'
              : 'This decision is final.'}
          </span>
        </>
      )}
    </div>
  )
}
