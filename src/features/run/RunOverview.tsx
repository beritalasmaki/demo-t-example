import { Activity, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { StatusBadge } from '../../components/StatusBadge'
import { resolveConfidenceAreas, confidenceLevel } from '../../lib/confidence'
import {
  formatCalendarDate,
  formatClock,
  formatClockRange,
  formatConfidenceAreaLabel,
  formatConfidencePercent,
  formatCount,
  formatElapsed,
  formatRunStatusLabel,
  formatUtcOffset,
} from '../../lib/format'
import { buildOpenItems, describeOpenItems } from '../../lib/openItems'
import { describeDecision, describePendingRun } from '../../lib/story'
import type { Run, RunStatus } from '../../lib/types'
import { cn } from '../../lib/utils'
import { ActorName } from './ActorName'
import { UndoBox } from './UndoBox'

/**
 * The top of the page (Region 1, rebuilt — docs/DECISIONS.md, 0038): status and initiative,
 * why the agent was asked, where the run is now, and one box on the right that holds the most
 * urgent thing — what is open before a decision, the undo window after one. Below that, two
 * rows of labelled facts. Run names such as `e91a4c` and `run-messy` are fields with a
 * plain-language line under them, so a reviewer never has to guess what an id is for.
 * The target environment is always here, above the fold (Scenario S6).
 *
 * The details collapse to one compact row once the reviewer moves between views, so the view
 * they chose sits near the top of the screen (docs/DECISIONS.md, 0044). The compact row keeps
 * what must never be hidden — status, initiative, system, environment, revision, and what is
 * open. "Show details" / "Hide details" sits on the header's bottom border in both states, so
 * the button does not move when it is pressed.
 */
export interface RunOverviewProps {
  run: Run
  onRunUpdated: (updatedRun: Run) => void
  /** Full details (true) or the compact row (false). */
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  /** Where "Jump to the open items" goes — the tick list in the decision panel. */
  openItemsHref?: string
}

/** Colour of the small dot in a neutral status pill. `approved` and `changes_requested` use
 * `StatusBadge` instead (docs/DECISIONS.md, 0029). */
const STATUS_DOT: Partial<Record<RunStatus, string>> = {
  running: 'bg-status-not-applicable',
  blocked: 'bg-status-fail',
  awaiting_review: 'bg-status-waived',
  rejected: 'bg-status-fail',
}

const ENVIRONMENT = {
  production: { dot: 'bg-status-fail', help: 'The live system. Real customers use it.' },
  staging: {
    dot: 'bg-status-waived',
    help: 'A test copy of the system. No real customers use it.',
  },
  dev: { dot: 'bg-status-not-applicable', help: 'A developer copy. No real customers use it.' },
} as const

const LABEL = 'text-caption font-normal font-body leading-none text-text-secondary'
const VALUE = 'text-body font-medium font-body leading-snug text-text-primary'
const HELP = 'text-caption font-normal font-body leading-relaxed text-text-secondary'
const EYEBROW =
  'flex items-center gap-[var(--space-2)] text-meta font-semibold font-heading leading-none tracking-wide uppercase text-primary'

function StatusPill({ status }: { status: RunStatus }) {
  if (status === 'approved')
    return <StatusBadge tone="success" label={formatRunStatusLabel(status)} />
  if (status === 'changes_requested')
    return <StatusBadge tone="warning" label={formatRunStatusLabel(status)} />
  return (
    <span className="inline-flex items-center gap-[var(--space-2)] rounded-full border border-border bg-surface-raised px-[var(--space-3)] py-[var(--space-1)] text-badge-label font-semibold font-heading whitespace-nowrap text-text-primary">
      <span aria-hidden className={cn('h-2 w-2 rounded-full', STATUS_DOT[status])} />
      {formatRunStatusLabel(status)}
    </span>
  )
}

function OpenItemsBox({ run, href }: { run: Run; href: string }) {
  const count = buildOpenItems(run).length
  const summary = describeOpenItems(run)
  if (count === 0) {
    return (
      <div className="flex w-full flex-col gap-[var(--space-2)] rounded-lg border border-border-subtle bg-bg p-[var(--space-4)] md:w-[17.5rem]">
        <span className="text-meta font-semibold font-heading text-text-primary">
          Nothing is open
        </span>
        <span className="text-meta font-normal font-body leading-relaxed text-text-primary">
          No check failed or was left without a result, and no score is low. Read the run, then
          decide.
        </span>
      </div>
    )
  }
  return (
    <div className="flex w-full flex-col gap-[var(--space-2)] rounded-lg border border-status-waived/40 bg-status-waived-tint-bg p-[var(--space-4)] md:w-[17.5rem]">
      <span className="text-meta font-semibold font-heading text-text-primary">
        {count === 1 ? '1 thing is open' : `${count} things are open`}
      </span>
      <span className="text-meta font-normal font-body leading-relaxed text-text-primary">
        {summary}
      </span>
      <a
        href={href}
        className="text-meta font-medium font-body text-primary no-underline underline-offset-2 hover:underline"
      >
        Jump to the open items →
      </a>
    </div>
  )
}

function EnvironmentTag({ environment }: { environment: Run['target']['environment'] }) {
  return (
    <span className="inline-flex items-center gap-[var(--space-2)] self-start rounded-full border border-border px-[var(--space-2)] py-[var(--space-1)] text-caption font-semibold font-heading leading-none tracking-wide whitespace-nowrap text-text-primary uppercase">
      <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', ENVIRONMENT[environment].dot)} />
      {environment}
    </span>
  )
}

function CompactOverview({ run, openItemsHref }: { run: Run; openItemsHref: string }) {
  const open = run.decision ? 0 : buildOpenItems(run).length
  return (
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-[var(--space-5)] gap-y-[var(--space-3)] px-[var(--space-4)] pt-[var(--space-4)] pb-[var(--space-5)] md:flex-nowrap md:px-[var(--space-6)]">
      <div className="flex min-w-0 flex-1 items-center gap-[var(--space-3)]">
        <div className="shrink-0">
          <StatusPill status={run.status} />
        </div>
        <h1
          id="run-heading"
          title={run.initiative}
          className="min-w-0 truncate text-section-heading leading-tight font-bold font-heading text-text-primary"
        >
          {run.initiative}
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-[var(--space-3)] md:shrink-0 md:flex-nowrap">
        <span className="text-meta font-medium font-body whitespace-nowrap text-text-primary">
          {run.target.system}
        </span>
        <EnvironmentTag environment={run.target.environment} />
        <span className="rounded-sm border border-border-subtle bg-surface-raised px-[var(--space-2)] py-[var(--space-1)] font-mono text-caption leading-none font-medium whitespace-nowrap text-text-secondary">
          {run.decision?.revision ?? run.revision}
        </span>
        {open > 0 && (
          <a
            href={openItemsHref}
            className="rounded-full border border-status-waived/40 bg-status-waived-tint-bg px-[var(--space-3)] py-[var(--space-1)] text-caption font-semibold font-body whitespace-nowrap text-text-primary no-underline hover:underline"
          >
            {formatCount(open, 'open item')}
          </a>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-[var(--space-2)]', className)}>
      <span className={LABEL}>{label}</span>
      {children}
    </div>
  )
}

export function RunOverview({
  run,
  onRunUpdated,
  expanded,
  onExpandedChange,
  openItemsHref = '#open-items',
}: RunOverviewProps) {
  const decided = run.decision != null
  const released = run.decision?.outcome === 'approved'
  const offset = formatUtcOffset(new Date(run.startedAt))
  const passed = run.gates.filter((gate) => gate.result === 'pass').length
  const failed = run.gates.filter((gate) => gate.result === 'fail').length
  const notRun = run.gates.filter((gate) => gate.result === 'unknown').length
  const waived = run.gates.filter((gate) => gate.result === 'waived').length
  const notApplicable = run.gates.filter((gate) => gate.result === 'not_applicable').length
  const lowest = resolveConfidenceAreas(run.confidence)
    .filter((area) => !area.missing)
    .sort((a, b) => (a.missing || b.missing ? 0 : a.value - b.value))[0]
  const env = ENVIRONMENT[run.target.environment]

  const toggle = (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls="run-overview"
      onClick={() => onExpandedChange(!expanded)}
      className="absolute bottom-0 left-1/2 z-10 inline-flex -translate-x-1/2 translate-y-1/2 cursor-pointer items-center gap-[var(--space-1)] rounded-full border border-border bg-surface px-[var(--space-3)] py-[var(--space-1)] text-caption font-semibold font-body whitespace-nowrap text-text-primary shadow-sm hover:bg-bg"
    >
      {expanded ? (
        <ChevronUp aria-hidden className="h-4 w-4" />
      ) : (
        <ChevronDown aria-hidden className="h-4 w-4" />
      )}
      {expanded ? 'Hide details' : 'Show details'}
    </button>
  )

  if (!expanded) {
    return (
      <header id="run-overview" className="relative border-b border-border-subtle bg-surface">
        <CompactOverview run={run} openItemsHref={openItemsHref} />
        {toggle}
      </header>
    )
  }

  return (
    <header id="run-overview" className="relative border-b border-border-subtle bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-[var(--space-4)] px-[var(--space-4)] py-[var(--space-6)] md:px-[var(--space-6)]">
        <div className="flex flex-col items-start justify-between gap-[var(--space-5)] md:flex-row md:gap-[var(--space-7)]">
          <div className="flex max-w-[47.5rem] flex-col gap-[var(--space-3)]">
            <div className="self-start">
              <StatusPill status={run.status} />
            </div>
            <h1
              id="run-heading"
              className="text-page-title leading-tight font-bold font-heading text-pretty text-text-primary"
            >
              {run.initiative}
            </h1>

            {run.assignment && (
              <div className="mt-[var(--space-2)] flex flex-col gap-[var(--space-2)]">
                <span className={EYEBROW}>
                  <Info aria-hidden className="h-4 w-4" />
                  Why the agent was asked
                </span>
                <p className="text-body font-normal font-body leading-relaxed text-text-primary md:text-item-title">
                  {run.assignment.context}{' '}
                  <ActorName name={run.assignment.by} className="align-middle" /> gave the change to
                  the agent because {run.assignment.reason}
                </p>
              </div>
            )}

            <div className="mt-[var(--space-1)] flex flex-col gap-[var(--space-2)] border-t border-border-subtle pt-[var(--space-3)]">
              <span className={EYEBROW}>
                <Activity aria-hidden className="h-4 w-4" />
                Where the run is now
              </span>
              <p className="text-body font-normal font-body leading-relaxed text-text-secondary md:text-item-title">
                {run.decision ? (
                  <>
                    <ActorName name={run.decision.by} className="align-middle text-text-primary" />{' '}
                    {describeDecision(run)}
                  </>
                ) : (
                  describePendingRun(run)
                )}
              </p>
            </div>
          </div>

          {decided ? (
            <UndoBox run={run} onRunUpdated={onRunUpdated} />
          ) : (
            <OpenItemsBox run={run} href={openItemsHref} />
          )}
        </div>

        <div className="grid grid-cols-2 gap-[var(--space-4)] border-t border-border-subtle pt-[var(--space-4)] lg:flex lg:gap-0">
          <Field
            label="Requested by"
            className="lg:flex-auto lg:border-r lg:border-border-subtle lg:pr-[var(--space-5)]"
          >
            <ActorName
              name={run.requestedBy}
              className={cn(VALUE, 'self-start whitespace-nowrap')}
            />
          </Field>
          <Field
            label="Agent"
            className="lg:flex-auto lg:border-r lg:border-border-subtle lg:px-[var(--space-5)]"
          >
            <span className={cn(VALUE, 'whitespace-nowrap')}>
              {run.agent.name} {run.agent.version}
            </span>
            <span className="font-mono text-caption text-text-secondary">{run.agent.model}</span>
          </Field>
          <Field
            label="Ran"
            className="lg:flex-auto lg:border-r lg:border-border-subtle lg:px-[var(--space-5)]"
          >
            <span className={cn(VALUE, 'lg:whitespace-nowrap')}>
              {formatCalendarDate(run.startedAt)} ·{' '}
              {run.finishedAt
                ? formatClockRange(run.startedAt, run.finishedAt)
                : `from ${formatClock(run.startedAt)}`}{' '}
              ({offset})
            </span>
            <span className={HELP}>
              {run.finishedAt
                ? formatElapsed(
                    new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime(),
                  )
                : 'Still running'}
            </span>
          </Field>
          <Field
            label="Checks"
            className="lg:flex-auto lg:border-r lg:border-border-subtle lg:px-[var(--space-5)]"
          >
            <span className={cn(VALUE, 'whitespace-nowrap')}>
              {passed} passed
              {failed > 0 && <span className="text-status-fail-tint-fg"> · {failed} failed</span>}
              {notRun > 0 && (
                <span className="text-status-waived-tint-fg"> · {notRun} not run</span>
              )}
            </span>
            {(waived > 0 || notApplicable > 0) && (
              <span className={HELP}>
                {[
                  waived > 0 ? formatCount(waived, 'exception') : null,
                  notApplicable > 0 ? `${notApplicable} does not apply` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            )}
          </Field>
          <Field label="Lowest score" className="lg:flex-auto lg:pl-[var(--space-5)]">
            {lowest && !lowest.missing ? (
              <span className={cn(VALUE, 'whitespace-nowrap')}>
                {formatConfidenceAreaLabel(lowest.area)} ·{' '}
                <span
                  className={
                    confidenceLevel(lowest.value) === 'low'
                      ? 'text-status-waived-tint-fg'
                      : undefined
                  }
                >
                  {formatConfidencePercent(lowest.value)}
                </span>
              </span>
            ) : (
              <span className={VALUE}>No scores reported</span>
            )}
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-[var(--space-5)] border-t border-border-subtle pt-[var(--space-4)] sm:grid-cols-3">
          <Field label={released ? 'Where it went' : 'Where it would go'}>
            <span className={VALUE}>{run.target.system}</span>
            <EnvironmentTag environment={run.target.environment} />
            <span className={HELP}>{env.help}</span>
          </Field>
          <Field label={released ? 'What was released' : 'What would be released'}>
            <span className={cn(VALUE, 'font-mono')}>{run.decision?.revision ?? run.revision}</span>
            <span className={HELP}>
              {decided
                ? 'The exact version of the code this decision applied to.'
                : 'The exact version this decision applies to.'}
            </span>
          </Field>
          <Field label="Run reference">
            <span className={cn(VALUE, 'font-mono')}>{run.id}</span>
            <span className={HELP}>Quote this to find the review again later.</span>
          </Field>
        </div>
      </div>
      {toggle}
    </header>
  )
}
