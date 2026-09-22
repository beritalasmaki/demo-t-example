import {
  CircleCheckBig,
  CircleX,
  Code2,
  Eye,
  FlaskConical,
  Loader2,
  OctagonAlert,
  Rocket,
  RotateCcw,
  Target as TargetIcon,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { Disclosure } from '../../components/Disclosure'
import { IconText } from '../../components/IconText'
import { RegionCard } from '../../components/RegionCard'
import { Tag } from '../../components/Tag'
import {
  formatDateTime,
  formatRelativeTime,
  formatRunStatusLabel,
  formatTimeZoneLabel,
} from '../../lib/format'
import type { Run } from '../../lib/types'

/**
 * Region 1: what this run is. See docs/spec-review-screen.md, Hierarchy and disclosure —
 * "First: what system, which environment, and current status. Second: initiative name and
 * who requested it. Hidden until opened: agent version, model version, run id, time zone
 * detail. Never hidden: the environment."
 *
 * Environment and status are rendered with `Tag`, not `StatusBadge`: `StatusBadge`'s tones
 * are `--color-status-*`, scoped by tokens.css and its own README to "a claim about a policy
 * check." Neither a workflow phase (running, approved, ...) nor a deployment environment is
 * that, so they get a colour-neutral pill instead — distinct by icon and exact label, not
 * colour, same as the accessibility rule asks for everywhere else.
 */
const ENVIRONMENT_ICON: Record<
  Run['target']['environment'],
  ComponentType<{ className?: string }>
> = {
  dev: Code2,
  staging: FlaskConical,
  production: Rocket,
}

const ENVIRONMENT_LABEL: Record<Run['target']['environment'], string> = {
  dev: 'Development',
  staging: 'Staging',
  production: 'Production',
}

const STATUS_ICON: Record<
  RunHeaderProps['run']['status'],
  ComponentType<{ className?: string }>
> = {
  running: Loader2,
  blocked: OctagonAlert,
  awaiting_review: Eye,
  approved: CircleCheckBig,
  changes_requested: RotateCcw,
  rejected: CircleX,
}

export interface RunHeaderProps {
  run: Run
}

export function RunHeader({ run }: RunHeaderProps) {
  const zone = formatTimeZoneLabel()

  return (
    <RegionCard as="header" className="flex flex-col gap-[var(--space-3)]">
      {/* First tier — never scrolled to, never hidden behind a disclosure. */}
      <div className="flex flex-wrap items-center gap-[var(--space-3)]">
        <h2
          id="run-header-heading"
          className="text-section-heading font-semibold text-text-primary"
        >
          <IconText icon={TargetIcon}>
            <span className="font-normal text-text-secondary">Target: </span>
            {run.target.system}
          </IconText>
        </h2>
        <Tag icon={ENVIRONMENT_ICON[run.target.environment]}>
          {ENVIRONMENT_LABEL[run.target.environment]}
        </Tag>
        <Tag icon={STATUS_ICON[run.status]}>{formatRunStatusLabel(run.status)}</Tag>
      </div>

      {/* Second tier — a separate row from the first, so a long initiative name can truncate
       * without any risk of clipping the environment or status above it. Truncated only at
       * md and up: below that, the `title` tooltip this relies on to reveal the rest never
       * fires on a touchscreen, which would otherwise silently hide "what was asked for" —
       * the first reviewer question (docs/spec-review-screen.md) — with no way to read it. */}
      <div className="flex min-w-0 flex-col gap-[var(--space-2)]">
        <p
          className="text-body min-w-0 font-normal font-body text-text-secondary md:truncate"
          title={run.initiative}
        >
          <span className="text-text-primary">{run.initiative}</span> — requested by{' '}
          {run.requestedBy}
        </p>
        <p className="text-meta font-normal font-body text-text-secondary">
          Started {formatDateTime(run.startedAt)} ({formatRelativeTime(run.startedAt)})
          {zone && ` ${zone}`}
          {run.finishedAt && (
            <>
              {' '}
              · Finished {formatDateTime(run.finishedAt)} ({formatRelativeTime(run.finishedAt)})
            </>
          )}
        </p>
      </div>

      {/* Hidden until opened. --text-item-title, not a larger size — must not visually
       * compete with real content when collapsed. */}
      <Disclosure
        summary={
          <span className="text-item-title font-semibold font-body text-text-secondary">
            Run details
          </span>
        }
      >
        <dl className="text-meta grid grid-cols-[auto_1fr] gap-x-[var(--space-2)] gap-y-[var(--space-3)] font-normal font-body">
          <dt className="text-text-secondary">Agent</dt>
          <dd className="text-text-primary">
            {run.agent.name} {run.agent.version}
          </dd>
          <dt className="text-text-secondary">Model</dt>
          <dd className="text-text-primary">{run.agent.model}</dd>
          <dt className="text-text-secondary">Run ID</dt>
          <dd className="text-text-primary">{run.id}</dd>
          <dt className="text-text-secondary">Time zone</dt>
          <dd className="text-text-primary">
            Times shown in {Intl.DateTimeFormat().resolvedOptions().timeZone}.
          </dd>
        </dl>
      </Disclosure>
    </RegionCard>
  )
}
