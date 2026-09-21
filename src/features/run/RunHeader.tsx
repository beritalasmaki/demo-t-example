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
} from 'lucide-react'
import type { ComponentType } from 'react'
import { Disclosure } from '../../components/Disclosure'
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
    <header className="flex flex-col gap-3">
      {/* First tier — never scrolled to, never hidden behind a disclosure. */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-lg font-semibold text-text-primary">{run.target.system}</span>
        <Tag icon={ENVIRONMENT_ICON[run.target.environment]}>
          {ENVIRONMENT_LABEL[run.target.environment]}
        </Tag>
        <Tag icon={STATUS_ICON[run.status]}>{formatRunStatusLabel(run.status)}</Tag>
      </div>

      {/* Second tier — a separate row from the first, so a long initiative name can truncate
       * without any risk of clipping the environment or status above it. */}
      <div className="flex min-w-0 flex-col gap-1 text-sm text-text-secondary">
        <p className="min-w-0 truncate" title={run.initiative}>
          <span className="text-text-primary">{run.initiative}</span> — requested by{' '}
          {run.requestedBy}
        </p>
        <p>
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

      {/* Hidden until opened. */}
      <Disclosure summary={<span className="text-sm text-text-secondary">Run details</span>}>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
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
    </header>
  )
}
