import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Archive,
  FileText,
  RotateCw,
} from 'lucide-react'
import type { ReactNode, Ref } from 'react'
import { InfoTip } from '../../components/InfoTip'
import { formatCalendarDate, formatRelativeTime } from '../../lib/format'
import type { ManualArchive, SortDirection, SortKey } from '../../lib/reviews'
import {
  archiveState,
  formatArchivesIn,
  formatReviewStage,
  isFinished,
  openItemCount,
  reviewStage,
  reviewStatus,
  updatedAt,
} from '../../lib/reviews'
import type { Run } from '../../lib/types'
import { cn } from '../../lib/utils'
import { ActorName } from './ActorName'
import { ReviewStatusPill, RunCell, StageSteps } from './ReviewParts'

/**
 * The My reviews table (docs/DECISIONS.md, 0060): one row per run, with its type, where it
 * is now, its open items, who asked, when it last changed, and what the reviewer can do.
 * A real `<table>`: column headers are announced with every cell, and the sorted column says
 * so through `aria-sort`.
 */

export interface SortSpec<K extends string> {
  key: K
  /** The direction a first click sorts in, and what each direction is called. */
  first: SortDirection
  firstText: string
  otherText: string
}

export interface ColumnHeaderProps<K extends string> {
  label: string
  /** Shown only to screen readers when the column has no visible label. */
  hiddenLabel?: string
  info?: string
  sort?: SortSpec<K>
  current?: { key: K; dir: SortDirection }
  onSort?: (key: K, dir: SortDirection) => void
  align?: 'start' | 'end'
  /** Which way the info tip opens; defaults to `align`. A column near the right edge opens
   * it leftwards, or it runs past the table and makes it scrollable. */
  tipAlign?: 'start' | 'end'
  className?: string
}

export function ColumnHeader<K extends string>({
  label,
  hiddenLabel,
  info,
  sort,
  current,
  onSort,
  align = 'start',
  tipAlign = align,
  className,
}: ColumnHeaderProps<K>) {
  const active = sort && current?.key === sort.key
  const dir = active ? current.dir : undefined
  const next: SortDirection | undefined = sort
    ? active
      ? dir === 'asc'
        ? 'desc'
        : 'asc'
      : sort.first
    : undefined
  const nextText = sort ? (next === sort.first ? sort.firstText : sort.otherText) : ''
  const SortIcon = dir === 'asc' ? ArrowUp : dir === 'desc' ? ArrowDown : ArrowUpDown

  return (
    <th
      scope="col"
      aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : undefined}
      className={cn(
        'px-[var(--space-2)] py-[var(--space-3)] text-left align-middle font-normal first:pl-[var(--space-5)] last:pr-[var(--space-5)]',
        className,
      )}
    >
      {hiddenLabel ? (
        <span className="sr-only">{hiddenLabel}</span>
      ) : (
        <span
          className={cn('flex items-center gap-[var(--space-2)]', align === 'end' && 'justify-end')}
        >
          <span className="text-caption leading-snug font-semibold font-heading whitespace-nowrap text-text-secondary">
            {label}
          </span>
          {info && (
            <InfoTip label={label} align={tipAlign}>
              {info}
            </InfoTip>
          )}
          {sort && next && (
            <button
              type="button"
              onClick={() => onSort?.(sort.key, next)}
              aria-label={`Order by ${label.toLowerCase()}: ${nextText}`}
              title={`Order by ${label.toLowerCase()}: ${nextText}`}
              className={cn(
                'inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-sm',
                'hover:bg-border-subtle hover:text-text-primary',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring',
                active ? 'bg-primary-tint text-primary' : 'text-text-secondary',
              )}
            >
              <SortIcon aria-hidden className="h-3 w-3" strokeWidth={2.5} />
            </button>
          )}
        </span>
      )}
    </th>
  )
}

export const CELL =
  'px-[var(--space-2)] py-[var(--space-3)] align-middle first:pl-[var(--space-5)] last:pr-[var(--space-5)]'

export const ICON_BUTTON =
  'inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-surface text-text-primary ' +
  'hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring'

/** The row's "decision details" button: first in the row, before the tick box. */
export function DetailsButton({ run, onClick }: { run: Run; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label={`Decision details: ${run.initiative}`}
      title="Show decision details"
      className={cn(
        ICON_BUTTON,
        'h-7 w-7 border-border-subtle text-text-secondary hover:bg-primary-tint',
      )}
    >
      <FileText aria-hidden className="h-3.5 w-3.5" />
    </button>
  )
}

export function SelectBox({
  run,
  checked,
  disabled,
  disabledReason,
  onToggle,
}: {
  run: Run
  checked: boolean
  disabled?: boolean
  disabledReason?: string
  onToggle: () => void
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onToggle}
      aria-label={`Select “${run.initiative}”`}
      title={disabled ? disabledReason : 'Select for a report or to archive'}
      className="h-4 w-4 cursor-pointer accent-primary disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    />
  )
}

/** "3", "2 accepted", "None", "Not known yet" — what the Open items column says. */
function OpenItemsCell({ run }: { run: Run }) {
  const count = openItemCount(run)
  const status = reviewStatus(run)
  const chip =
    'rounded-full px-[var(--space-3)] py-[var(--space-1)] text-caption font-semibold font-body whitespace-nowrap'
  const muted = 'text-meta whitespace-nowrap text-text-secondary'
  if (count === null) return <span className={muted}>Not known yet</span>
  if (count === 0) return <span className={muted}>None</span>
  if (status === 'approved') {
    return (
      <span className={cn(chip, 'bg-surface-raised text-text-secondary')}>{count} accepted</span>
    )
  }
  if (status === 'declined') {
    return <span className={cn(chip, 'bg-surface-raised text-text-secondary')}>{count}</span>
  }
  return (
    <span className={cn(chip, 'bg-status-waived-tint-bg text-status-waived-tint-fg')}>{count}</span>
  )
}

function StageCell({ run }: { run: Run }) {
  const stage = reviewStage(run)
  if (stage) {
    return (
      <div className="flex flex-col gap-[var(--space-2)]">
        <StageSteps stage={stage} />
        <span
          className={cn(
            'text-meta leading-snug font-body',
            stage === 'review'
              ? 'font-semibold text-status-waived-tint-fg'
              : 'font-medium text-text-primary',
          )}
        >
          {formatReviewStage(stage)}
        </span>
      </div>
    )
  }
  if (reviewStatus(run) === 'requested') {
    return <span className="text-meta font-medium text-text-primary">Agent is making changes</span>
  }
  return <span className="text-meta text-text-secondary">Decided</span>
}

export function DateCell({ date, sub }: { date: string; sub: ReactNode }) {
  return (
    <div className="flex flex-col gap-[var(--space-1)] whitespace-nowrap">
      <span className="text-meta font-medium text-text-primary">{date}</span>
      <span className="text-caption text-text-secondary">{sub}</span>
    </div>
  )
}

export interface ReviewsTableProps {
  runs: Run[]
  caption: string
  runHref: (id: string) => string
  sort: { key: SortKey; dir: SortDirection }
  onSort: (key: SortKey, dir: SortDirection) => void
  selected: ReadonlySet<string>
  onToggle: (id: string) => void
  manual: ManualArchive
  now: Date
  onDetails: (id: string) => void
  onNewRun: (id: string) => void
  onArchive: (id: string) => void
  ref?: Ref<HTMLTableElement>
}

const INFO = {
  type: 'Where the run stands overall: Pending, Requested for change, Declined or Approved.',
  stage:
    'Pending runs go through three steps: the agent works, the checks run, then a person reviews. Runs that are not ready yet are listed below the table.',
  open: 'Things the run could not finish or check. You must look at each one before you approve.',
  requester: 'The person who asked the agent to make this change.',
  updated:
    'The last time something happened in this run. Finished runs also show when they will be archived.',
  action: 'What you can do now: review a pending run, or archive a finished one.',
}

export function ReviewsTable({
  runs,
  caption,
  runHref,
  sort,
  onSort,
  selected,
  onToggle,
  manual,
  now,
  onDetails,
  onNewRun,
  onArchive,
  ref,
}: ReviewsTableProps) {
  const header = { current: sort, onSort }
  return (
    <table ref={ref} tabIndex={-1} className="w-full min-w-[75rem] border-collapse outline-none">
      <caption className="sr-only">{caption}</caption>
      <colgroup>
        <col className="w-12" />
        <col className="w-9" />
        <col />
        <col className="w-44" />
        <col className="w-44" />
        <col className="w-28" />
        <col className="w-48" />
        <col className="w-36" />
        <col className="w-28" />
      </colgroup>
      <thead className="border-b border-border-subtle bg-surface-raised">
        <tr>
          <ColumnHeader label="Details" hiddenLabel="Decision details" />
          <ColumnHeader label="Select" hiddenLabel="Select" />
          <ColumnHeader
            label="Run"
            sort={{ key: 'run', first: 'asc', firstText: 'A to Z', otherText: 'Z to A' }}
            {...header}
          />
          <ColumnHeader
            label="Run type"
            info={INFO.type}
            sort={{
              key: 'type',
              first: 'asc',
              firstText: 'Pending first',
              otherText: 'Approved first',
            }}
            {...header}
          />
          <ColumnHeader
            label="Where it is now"
            info={INFO.stage}
            sort={{
              key: 'stage',
              first: 'asc',
              firstText: 'Needs your review first',
              otherText: 'Decided first',
            }}
            {...header}
          />
          <ColumnHeader
            label="Open items"
            info={INFO.open}
            sort={{
              key: 'open',
              first: 'desc',
              firstText: 'Most first',
              otherText: 'Fewest first',
            }}
            {...header}
          />
          <ColumnHeader
            label="Requested by"
            info={INFO.requester}
            sort={{ key: 'requester', first: 'asc', firstText: 'A to Z', otherText: 'Z to A' }}
            {...header}
          />
          <ColumnHeader
            label="Updated"
            info={INFO.updated}
            tipAlign="end"
            sort={{
              key: 'updated',
              first: 'desc',
              firstText: 'Newest first',
              otherText: 'Oldest first',
            }}
            {...header}
          />
          <ColumnHeader label="Action" info={INFO.action} align="end" />
        </tr>
      </thead>
      <tbody>
        {runs.map((run) => {
          const finished = isFinished(run)
          const archive = archiveState(run, manual, now)
          const updated = updatedAt(run)
          return (
            <tr key={run.id} className="border-b border-border-subtle bg-surface hover:bg-bg">
              <td className={CELL}>
                <DetailsButton run={run} onClick={() => onDetails(run.id)} />
              </td>
              <td className={CELL}>
                <SelectBox
                  run={run}
                  checked={selected.has(run.id)}
                  disabled={!finished}
                  disabledReason="Only approved and declined runs can be selected"
                  onToggle={() => onToggle(run.id)}
                />
              </td>
              <td className={cn(CELL, 'max-w-0')}>
                <RunCell run={run} href={runHref(run.id)} />
              </td>
              <td className={CELL}>
                <ReviewStatusPill status={reviewStatus(run)} />
              </td>
              <td className={CELL}>
                <StageCell run={run} />
              </td>
              <td className={CELL}>
                <OpenItemsCell run={run} />
              </td>
              <td className={CELL}>
                <ActorName
                  name={run.requestedBy}
                  className="text-meta font-medium whitespace-nowrap"
                />
              </td>
              <td className={CELL}>
                <DateCell
                  date={formatCalendarDate(updated)}
                  sub={
                    archive.autoAt
                      ? formatArchivesIn(archive.autoAt, now)
                      : formatRelativeTime(updated, now)
                  }
                />
              </td>
              <td className={cn(CELL, 'text-right')}>
                {reviewStage(run) === 'review' ? (
                  <a
                    href={runHref(run.id)}
                    aria-label={`Review “${run.initiative}”`}
                    className="inline-flex items-center gap-[var(--space-2)] rounded-md border border-text-primary bg-text-primary px-[var(--space-3)] py-[var(--space-2)] text-meta leading-none font-semibold font-heading whitespace-nowrap text-surface no-underline hover:opacity-90"
                  >
                    Review
                    <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                  </a>
                ) : finished ? (
                  <span className="inline-flex gap-[var(--space-2)]">
                    <button
                      type="button"
                      onClick={() => onNewRun(run.id)}
                      aria-label={`Request a new run: ${run.initiative}`}
                      title="Request a new run to fix a mistake"
                      className={ICON_BUTTON}
                    >
                      <RotateCw aria-hidden className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onArchive(run.id)}
                      aria-label={`Archive “${run.initiative}”`}
                      title="Archive"
                      className={ICON_BUTTON}
                    >
                      <Archive aria-hidden className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ) : (
                  <span className="text-meta text-text-secondary">
                    <span aria-hidden>—</span>
                    <span className="sr-only">Nothing to do yet</span>
                  </span>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
