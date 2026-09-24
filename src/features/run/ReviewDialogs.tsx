import { ArrowRight, Download, FileBarChart, RotateCw } from 'lucide-react'
import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { Modal } from '../../components/Modal'
import { undoWindow } from '../../lib/decision'
import { formatCalendarDate, formatClock, formatDuration, formatUtcOffset } from '../../lib/format'
import { buildOpenItems } from '../../lib/openItems'
import type { ReportInclude, ReviewStatus } from '../../lib/reviews'
import {
  formatReviewStage,
  formatReviewStatus,
  isFinished,
  reviewStage,
  reviewStatus,
} from '../../lib/reviews'
import type { Run } from '../../lib/types'
import { cn } from '../../lib/utils'
import { ActorName } from './ActorName'
import { ReviewStatusPill } from './ReviewParts'

/**
 * The three dialogs My reviews opens (docs/DECISIONS.md, 0060): a run's decision details,
 * a request for a new run to fix a mistake, and a report on the selected runs. Every fact in
 * them is read from the run itself.
 */

const PRIMARY =
  'inline-flex cursor-pointer items-center gap-[var(--space-2)] rounded-md border border-text-primary bg-text-primary px-[var(--space-4)] py-[var(--space-3)] ' +
  'text-body leading-none font-semibold font-heading whitespace-nowrap text-surface no-underline hover:opacity-90 ' +
  'disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-border-subtle disabled:text-text-disabled disabled:hover:opacity-100 ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring'
const SECONDARY =
  'inline-flex cursor-pointer items-center gap-[var(--space-2)] rounded-md border border-border bg-surface px-[var(--space-4)] py-[var(--space-3)] ' +
  'text-body leading-none font-semibold font-heading whitespace-nowrap text-text-primary hover:border-text-secondary ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring'
const SECTION_LABEL =
  'text-caption leading-none font-semibold font-heading tracking-wider text-text-secondary uppercase'
const TEXTAREA =
  'w-full resize-y rounded-md border border-border bg-surface px-[var(--space-3)] py-[var(--space-2)] text-body font-body text-text-primary ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring'

function Footer({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-[var(--space-5)] -mb-[var(--space-5)] flex flex-wrap items-center gap-[var(--space-3)] rounded-b-md border-t border-border-subtle bg-bg px-[var(--space-5)] py-[var(--space-4)]">
      {children}
    </div>
  )
}

function whenDecided(iso: string): string {
  return `${formatCalendarDate(iso)} at ${formatClock(iso)} (${formatUtcOffset(new Date(iso))})`
}

const DECISION_TITLE: Record<ReviewStatus, string> = {
  approved: 'Approved',
  declined: 'Declined',
  requested: 'Changes requested',
  pending: 'No decision yet',
}

// ---- Decision details ------------------------------------------------------------------

export interface DecisionDetailsDialogProps {
  run: Run
  href: string
  now: Date
  onClose: () => void
  onNewRun: () => void
}

export function DecisionDetailsDialog({
  run,
  href,
  now,
  onClose,
  onNewRun,
}: DecisionDetailsDialogProps) {
  const status = reviewStatus(run)
  const stage = reviewStage(run)
  const decision = run.decision

  let heading = 'Reason given'
  let reason = decision?.reason ?? ''
  let next = ''
  if (status === 'approved' && decision) {
    const undo = undoWindow(decision, now)
    next = `Released to ${run.target.system} (${run.target.environment}). ${
      undo.active
        ? `You can still undo it for ${formatDuration(undo.remainingMs)}.`
        : 'The undo time has ended.'
    }`
  } else if (status === 'declined') {
    next = 'Nothing was released. The run is closed.'
  } else if (status === 'requested') {
    next = 'The agent is making the changes. The new run comes back to you for review.'
  } else {
    heading = 'What happens now'
    reason =
      stage === 'review'
        ? 'The agent has finished and the checks have run. The run is waiting for your decision.'
        : stage === 'checks'
          ? 'The agent has finished. The automatic checks are still running.'
          : 'The agent is still working on the change.'
    next =
      stage === 'review'
        ? 'Open the review to decide.'
        : 'You will get a message when the run is ready for you.'
  }

  const accepted = new Set(decision?.acknowledgedItemIds ?? [])
  const items =
    run.status === 'running'
      ? null
      : buildOpenItems(run).filter((item) => status !== 'approved' || accepted.has(item.id))

  return (
    <Modal
      title={run.initiative}
      eyebrow="Decision details"
      onClose={onClose}
      className="max-w-[37.5rem]"
    >
      <p className="flex items-center gap-[var(--space-2)] text-caption text-text-secondary">
        <span className="font-mono">{run.id}</span>
        <span aria-hidden className="text-text-secondary">
          ·
        </span>
        {run.target.system}
      </p>

      <section className="flex flex-col gap-[var(--space-3)] rounded-lg bg-surface-raised p-[var(--space-4)]">
        <h3 className={SECTION_LABEL}>Decision</h3>
        <div className="flex flex-wrap items-center gap-[var(--space-3)]">
          <ReviewStatusPill status={status} label={DECISION_TITLE[status]} />
          {decision && <ActorName name={decision.by} className="text-meta font-medium" />}
        </div>
        <p className="text-meta text-text-secondary">
          {decision ? whenDecided(decision.at) : stage ? formatReviewStage(stage) : ''}
        </p>
      </section>

      <section className="flex flex-col gap-[var(--space-2)]">
        <h3 className={SECTION_LABEL}>{heading}</h3>
        {reason ? (
          <p className="rounded-r-md border-l-4 border-border bg-bg px-[var(--space-4)] py-[var(--space-3)] text-body leading-relaxed text-text-primary">
            {reason}
          </p>
        ) : (
          <p className="text-body text-text-secondary">No reason was given.</p>
        )}
        <p className="text-meta text-text-secondary">{next}</p>
      </section>

      <section className="flex flex-col gap-[var(--space-2)]">
        <h3 className={SECTION_LABEL}>
          {status === 'approved' ? 'Open items accepted' : 'Open items'}
        </h3>
        {items === null ? (
          <p className="text-body text-text-secondary">
            Not known yet. The agent is still working.
          </p>
        ) : items.length === 0 ? (
          <p className="text-body text-text-secondary">None. Everything was checked.</p>
        ) : (
          <ul className="flex flex-col gap-[var(--space-1)]">
            {items.map((item) => (
              <li key={item.id} className="flex gap-[var(--space-2)] text-body text-text-primary">
                <span
                  aria-hidden
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-status-waived"
                />
                {item.text}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-[var(--space-2)]">
        <h3 className={SECTION_LABEL}>Requested by</h3>
        <ActorName name={run.requestedBy} className="self-start text-meta font-medium" />
      </section>

      <Footer>
        {isFinished(run) && (
          <button type="button" onClick={onNewRun} className={SECONDARY}>
            <RotateCw aria-hidden className="h-3.5 w-3.5" />
            Request a new run
          </button>
        )}
        <span className="flex-1" />
        <button type="button" onClick={onClose} className={SECONDARY}>
          Close
        </button>
        <a href={href} className={PRIMARY}>
          Open the full review
          <ArrowRight aria-hidden className="h-3.5 w-3.5" />
        </a>
      </Footer>
    </Modal>
  )
}

// ---- Request a new run -----------------------------------------------------------------

export interface NewRunDialogProps {
  run: Run
  onClose: () => void
  onSend: (request: { whatWentWrong: string; whatToDo: string }) => void
}

const NEW_RUN_STEPS = [
  'You send the request',
  'The requester agrees or says no',
  'The agent makes a new run',
  'You review the new run',
]

export function NewRunDialog({ run, onClose, onSend }: NewRunDialogProps) {
  const [whatWentWrong, setWhatWentWrong] = useState('')
  const [whatToDo, setWhatToDo] = useState('')
  const wrongId = useId()
  const doId = useId()
  const ready = whatWentWrong.trim().length > 0

  return (
    <Modal title="Request a new run" onClose={onClose} className="max-w-[37.5rem]">
      <div className="flex flex-col gap-[var(--space-1)] rounded-md bg-surface-raised px-[var(--space-4)] py-[var(--space-3)]">
        <span className="text-caption text-text-secondary">The run with the mistake</span>
        <span className="text-body font-semibold text-text-primary">{run.initiative}</span>
        <span className="flex items-center gap-[var(--space-2)] text-caption text-text-secondary">
          <span className="font-mono">{run.id}</span>
          <span aria-hidden className="text-text-secondary">
            ·
          </span>
          {formatReviewStatus(reviewStatus(run))}
          {run.decision && ` on ${formatCalendarDate(run.decision.at)}`}
        </span>
      </div>
      <p className="text-body leading-relaxed text-text-primary">
        Past runs cannot be changed. They stay in the record exactly as they were decided. A new run
        fixes the mistake, and it links back to this run so the history stays clear.
      </p>
      <div className="flex flex-col gap-[var(--space-2)]">
        <label htmlFor={wrongId} className="text-meta font-semibold text-text-primary">
          What went wrong? <span className="font-normal text-text-secondary">(required)</span>
        </label>
        <textarea
          id={wrongId}
          rows={3}
          required
          value={whatWentWrong}
          onChange={(event) => setWhatWentWrong(event.target.value)}
          placeholder="For example: the refund amount is rounded the wrong way for Swedish orders."
          className={TEXTAREA}
        />
      </div>
      <div className="flex flex-col gap-[var(--space-2)]">
        <label htmlFor={doId} className="text-meta font-semibold text-text-primary">
          What should the new run do?
        </label>
        <textarea
          id={doId}
          rows={2}
          value={whatToDo}
          onChange={(event) => setWhatToDo(event.target.value)}
          placeholder="For example: round to the nearest öre and add a test for it."
          className={TEXTAREA}
        />
      </div>
      <div className="flex flex-col gap-[var(--space-3)] border-t border-border-subtle pt-[var(--space-4)]">
        <p className="text-body leading-loose text-text-primary">
          Your request goes first to{' '}
          <ActorName name={run.requestedBy} className="align-middle text-meta font-medium" />, who
          asked for the original change.
        </p>
        <ol className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-4">
          {NEW_RUN_STEPS.map((step, index) => (
            <li key={step} className="flex flex-col items-start gap-[var(--space-2)]">
              <span
                aria-hidden
                className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-caption font-semibold',
                  index === 0
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary-tint text-primary',
                )}
              >
                {index + 1}
              </span>
              <span className="text-caption font-medium text-text-primary">{step}</span>
            </li>
          ))}
        </ol>
      </div>
      <Footer>
        <span className="flex-1" />
        <button type="button" onClick={onClose} className={SECONDARY}>
          Cancel
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => onSend({ whatWentWrong: whatWentWrong.trim(), whatToDo: whatToDo.trim() })}
          className={PRIMARY}
        >
          Send request
        </button>
      </Footer>
    </Modal>
  )
}

// ---- Create a report -------------------------------------------------------------------

export type ReportFormat = 'pdf' | 'csv'

export interface ReportDialogProps {
  count: number
  fromArchive: number
  defaultName: string
  onClose: () => void
  onCreate: (report: { name: string; format: ReportFormat; include: ReportInclude }) => void
}

const INCLUDE: { key: keyof ReportInclude; label: string; hint?: string }[] = [
  { key: 'decision', label: 'Decision, name, time and reason' },
  { key: 'open', label: 'Open items and how they were handled' },
  { key: 'checks', label: 'Checks and confidence scores' },
  {
    key: 'steps',
    label: 'Every agent step',
    hint: 'Makes the report much longer. Useful for audits.',
  },
]

export function ReportDialog({
  count,
  fromArchive,
  defaultName,
  onClose,
  onCreate,
}: ReportDialogProps) {
  const [name, setName] = useState(defaultName)
  const [format, setFormat] = useState<ReportFormat>('pdf')
  const [include, setInclude] = useState<ReportInclude>({
    decision: true,
    open: true,
    checks: true,
    steps: false,
  })
  const nameId = useId()
  const formatName = useId()

  return (
    <Modal title="Create a report" onClose={onClose} className="max-w-[37.5rem]">
      <p className="flex items-center gap-[var(--space-2)] text-body text-text-secondary">
        <FileBarChart aria-hidden className="h-4 w-4 text-primary" />
        {count} run{count === 1 ? '' : 's'} selected
        {fromArchive > 0 && `, ${fromArchive} from the archive`}
      </p>
      <div className="flex flex-col gap-[var(--space-2)]">
        <label htmlFor={nameId} className="text-meta font-semibold text-text-primary">
          Report name
        </label>
        <input
          id={nameId}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={TEXTAREA}
        />
      </div>
      <fieldset className="flex flex-col gap-[var(--space-2)]">
        <legend className="mb-[var(--space-2)] text-meta font-semibold text-text-primary">
          Format
        </legend>
        <div className="flex gap-[var(--space-1)] self-start rounded-lg bg-surface-raised p-[var(--space-1)]">
          {(
            [
              ['pdf', 'PDF, for reading and sharing'],
              ['csv', 'CSV, for spreadsheets'],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={cn(
                'cursor-pointer rounded-md px-[var(--space-4)] py-[var(--space-2)] text-meta font-semibold font-heading whitespace-nowrap',
                'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus-ring',
                format === value ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary',
              )}
            >
              <input
                type="radio"
                name={formatName}
                value={value}
                checked={format === value}
                onChange={() => setFormat(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-[var(--space-1)]">
        <legend className="mb-[var(--space-2)] text-meta font-semibold text-text-primary">
          What to include
        </legend>
        {INCLUDE.map((option) => (
          <label
            key={option.key}
            className="flex cursor-pointer items-start gap-[var(--space-3)] py-[var(--space-2)]"
          >
            <input
              type="checkbox"
              checked={include[option.key]}
              onChange={() =>
                setInclude((current) => ({ ...current, [option.key]: !current[option.key] }))
              }
              className="mt-0.5 h-4 w-4 cursor-pointer accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            />
            <span className="flex flex-col gap-[var(--space-1)]">
              <span className="text-body font-medium text-text-primary">{option.label}</span>
              {option.hint && (
                <span className="text-caption text-text-secondary">{option.hint}</span>
              )}
            </span>
          </label>
        ))}
      </fieldset>
      <Footer>
        <span className="flex-1" />
        <button type="button" onClick={onClose} className={SECONDARY}>
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onCreate({ name: name.trim() || defaultName, format, include })}
          className={PRIMARY}
        >
          <Download aria-hidden className="h-4 w-4" />
          Create report
        </button>
      </Footer>
    </Modal>
  )
}
