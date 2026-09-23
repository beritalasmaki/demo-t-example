import { ArrowLeft, Check, Info, ShieldCheck, X } from 'lucide-react'
import { useId, useState } from 'react'
import type { SubmitDecisionOptions } from '../../lib/api'
import { UNDO_WINDOW_MINUTES } from '../../lib/decision'
import { formatCount } from '../../lib/format'
import { approvalNeedsReason, buildOpenItems, missingChecks } from '../../lib/openItems'
import type { Decision, Run } from '../../lib/types'
import { cn } from '../../lib/utils'
import { ActorName } from './ActorName'
import { CURRENT_REVIEWER } from './currentReviewer'
import { DecisionDialog } from './DecisionDialog'
import type { DecisionAction } from './DecisionDialog'
import { SectionHeading } from './SectionHeading'

/**
 * "Your decision" — the right-hand panel before a decision (Region 6). Two numbered steps:
 * confirm each open item, then choose one action. docs/DECISIONS.md, 0040: every open item is
 * ticked separately, and approving with a check that failed or did not run needs a written
 * reason. docs/DECISIONS.md, 0039: "Approve and release" is the only filled button; "Request
 * changes" and "Reject run" sit below a divider, and every action says what happens next.
 *
 * Each action still opens `DecisionDialog`, which names the revision and target before
 * anything is recorded (spec, Acceptance criteria: "The confirmation names the revision and
 * the target environment") and asks for the reason for the other two actions.
 */
export interface DecisionPanelProps {
  run: Run
  reviewerName?: string
  onRunUpdated: (updatedRun: Run) => void
  submitDecisionOptions?: SubmitDecisionOptions
  /** Mainly for stories: start with these open items already ticked. */
  defaultTickedIds?: string[]
  /** Mainly for stories: start with this reason already written. */
  defaultReason?: string
}

const OUTLINE_BUTTON =
  'inline-flex w-full items-center justify-center gap-[var(--space-3)] rounded-md border bg-surface px-[var(--space-4)] py-[var(--space-3)] ' +
  'text-body font-semibold font-heading leading-none whitespace-nowrap cursor-pointer'

function StepNumber({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-semibold font-body leading-none text-primary-foreground"
    >
      {children}
    </span>
  )
}

export function DecisionPanel({
  run,
  reviewerName = CURRENT_REVIEWER,
  onRunUpdated,
  submitDecisionOptions,
  defaultTickedIds = [],
  defaultReason = '',
}: DecisionPanelProps) {
  const items = buildOpenItems(run)
  const [ticked, setTicked] = useState<Set<string>>(() => new Set(defaultTickedIds))
  const [reason, setReason] = useState(defaultReason)
  const [openAction, setOpenAction] = useState<DecisionAction | null>(null)
  const reasonId = useId()
  const hintId = useId()

  const left = items.filter((item) => !ticked.has(item.id)).length
  const reasonRequired = approvalNeedsReason(run)
  const missing = missingChecks(run).length
  const hasReason = reason.trim().length > 0
  const ready = left === 0 && (!reasonRequired || hasReason)

  const todo: string[] = []
  if (left > 0) todo.push(`tick ${formatCount(left, 'more item')}`)
  if (reasonRequired && !hasReason) todo.push('add a reason')
  const approveHint = ready
    ? `Ready. Releases ${run.revision} to ${run.target.system} in ${run.target.environment}. You can undo for ${UNDO_WINDOW_MINUTES} minutes.`
    : `To approve, ${todo.join(' and ')}.`

  function toggle(id: string) {
    setTicked((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function applyConflict(decision: Decision) {
    onRunUpdated({ ...run, decision, status: decision.outcome })
  }

  return (
    <section
      aria-labelledby="decision-heading"
      className="flex flex-col gap-[var(--space-4)] rounded-lg border border-border bg-surface p-[var(--space-4)]"
    >
      <div className="flex flex-col gap-[var(--space-1)]">
        <SectionHeading id="decision-heading" icon={ShieldCheck}>
          Your decision
        </SectionHeading>
        <p className="text-meta font-normal font-body text-text-secondary">
          Made by you, never by the agent. You can undo it for {UNDO_WINDOW_MINUTES} minutes.
        </p>
      </div>

      <div className="flex flex-col gap-[var(--space-2)]">
        <span className="text-caption font-normal font-body text-text-secondary">Deciding as</span>
        <ActorName name={reviewerName} className="self-start text-body font-medium" />
      </div>

      <fieldset
        id="open-items"
        className="flex scroll-mt-[calc(var(--run-bar-height,4rem)+var(--space-4))] flex-col gap-[var(--space-2)]"
      >
        <legend className="mb-[var(--space-2)] flex w-full items-center gap-[var(--space-2)] text-meta font-semibold font-heading text-text-primary">
          <StepNumber>1</StepNumber>
          Confirm each open item
          {items.length > 0 && (
            <span className="ml-auto text-caption font-normal font-body text-text-secondary">
              {items.length - left} of {items.length}
            </span>
          )}
        </legend>
        {items.length === 0 ? (
          <p className="text-caption font-normal font-body text-text-secondary">
            Nothing is open: no check failed or was left without a result, and no score is low.
          </p>
        ) : (
          <>
            <p className="text-caption font-normal font-body leading-relaxed text-text-secondary">
              {run.target.environment === 'production'
                ? 'This change goes to production. Tick each item to say you have seen it and accept it.'
                : 'Tick each item to say you have seen it and accept it.'}
            </p>
            {items.map((item) => {
              const checked = ticked.has(item.id)
              return (
                <label
                  key={item.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-[var(--space-3)] rounded-md border px-[var(--space-3)] py-[var(--space-3)]',
                    'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus-ring',
                    checked
                      ? 'border-border-subtle bg-bg'
                      : 'border-status-waived/40 bg-status-waived-tint-bg',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(item.id)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      'mt-[var(--space-1)] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-status-waived',
                      checked ? 'bg-status-waived text-surface' : 'bg-surface text-transparent',
                    )}
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-meta font-normal font-body leading-relaxed text-text-primary">
                    {item.text}
                  </span>
                </label>
              )
            })}
          </>
        )}
      </fieldset>

      <div className="flex flex-col gap-[var(--space-3)] border-t border-border-subtle pt-[var(--space-4)]">
        <span className="flex items-center gap-[var(--space-2)] text-meta font-semibold font-heading text-text-primary">
          <StepNumber>2</StepNumber>
          Choose one
        </span>

        <div className="flex flex-col gap-[var(--space-2)]">
          <label
            htmlFor={reasonId}
            className="text-caption font-semibold font-body text-text-primary"
          >
            Reason for approving{' '}
            <span className="font-normal text-text-secondary">
              {reasonRequired
                ? `(required: ${formatCount(missing, 'check')} ${missing === 1 ? 'is' : 'are'} missing)`
                : '(optional)'}
            </span>
          </label>
          <textarea
            id={reasonId}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            required={reasonRequired}
            placeholder={
              reasonRequired
                ? 'For example: these checks do not apply because no new dependencies or screens were added.'
                : undefined
            }
            className="w-full resize-y rounded-md border border-border bg-surface px-[var(--space-3)] py-[var(--space-2)] text-meta font-normal font-body leading-relaxed text-text-primary placeholder:text-text-secondary focus-visible:border-primary"
          />
          <button
            type="button"
            onClick={() => setOpenAction('approved')}
            disabled={!ready}
            aria-describedby={hintId}
            className={cn(
              'inline-flex items-center justify-center gap-[var(--space-3)] rounded-md border px-[var(--space-4)] py-[var(--space-3)]',
              'text-body font-semibold font-heading leading-none whitespace-nowrap',
              ready
                ? 'cursor-pointer border-text-primary bg-text-primary text-surface hover:opacity-90'
                : 'cursor-not-allowed border-border-subtle bg-border-subtle text-text-disabled',
            )}
          >
            <Check aria-hidden className="h-4 w-4" strokeWidth={2.5} />
            Approve and release
          </button>
          <span
            id={hintId}
            className="text-caption font-normal font-body leading-relaxed text-text-secondary"
            aria-live="polite"
          >
            {approveHint}
          </span>
        </div>

        <div
          className="my-[var(--space-1)] flex items-center gap-[var(--space-3)] text-caption font-normal font-body text-text-secondary"
          role="separator"
        >
          <span className="h-px flex-1 bg-border-subtle" />
          or, if it is not ready
          <span className="h-px flex-1 bg-border-subtle" />
        </div>

        <div className="flex flex-col gap-[var(--space-2)]">
          <button
            type="button"
            onClick={() => setOpenAction('changes_requested')}
            className={cn(
              OUTLINE_BUTTON,
              'border-border text-text-primary hover:border-text-secondary hover:bg-bg active:bg-surface-raised',
            )}
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Request changes
          </button>
          <span className="text-caption font-normal font-body leading-relaxed text-text-secondary">
            Sends the run back to the agent with your reason. The agent tries again. Nothing is
            released.
          </span>
        </div>

        <div className="flex flex-col gap-[var(--space-2)]">
          <button
            type="button"
            onClick={() => setOpenAction('rejected')}
            className={cn(
              OUTLINE_BUTTON,
              'border-status-fail text-status-fail-tint-fg hover:bg-status-fail-tint-bg active:bg-status-fail-tint-bg',
            )}
          >
            <X aria-hidden className="h-4 w-4" />
            Reject run
          </button>
          <span className="text-caption font-normal font-body leading-relaxed text-text-secondary">
            Closes the run for good. The agent does not try again. Nothing is released.
          </span>
        </div>
      </div>

      <p className="flex gap-[var(--space-2)] rounded-md bg-surface-raised px-[var(--space-3)] py-[var(--space-3)] text-caption font-normal font-body leading-relaxed text-text-secondary">
        <Info aria-hidden className="mt-[var(--space-1)] h-4 w-4 shrink-0" />
        Request changes and Reject run also ask for a short reason. Your name, the time, your ticks
        and your reason are saved with the run.
      </p>

      {openAction && (
        <DecisionDialog
          action={openAction}
          runId={run.id}
          revision={run.revision}
          environment={run.target.environment}
          reviewerName={reviewerName}
          acknowledgedItemIds={openAction === 'approved' ? [...ticked] : []}
          approvalReason={reason}
          onClose={() => setOpenAction(null)}
          onDecided={(updatedRun) => {
            onRunUpdated(updatedRun)
            setOpenAction(null)
          }}
          onConflict={applyConflict}
          submitDecisionOptions={submitDecisionOptions}
        />
      )}
    </section>
  )
}
