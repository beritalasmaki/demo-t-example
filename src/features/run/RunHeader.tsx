import { Code2, Eye, FlaskConical, Loader2, OctagonAlert, CircleX, Rocket } from 'lucide-react'
import type { ComponentType } from 'react'
import type { StatusBadgeTone } from '../../components/StatusBadge'
import { StatusBadge } from '../../components/StatusBadge'
import { Disclosure } from '../../components/Disclosure'
import { RegionCard } from '../../components/RegionCard'
import { Tag } from '../../components/Tag'
import {
  formatDateTime,
  formatRelativeTime,
  formatRunStatusLabel,
  formatTimeZoneLabel,
} from '../../lib/format'
import type { Run } from '../../lib/types'
import { ActorName } from './ActorName'

/**
 * Region 1: what this run is. See docs/spec-review-screen.md, Hierarchy and disclosure —
 * updated (docs/DECISIONS.md) to: "First: environment and status. Second: the initiative —
 * now the card's headline, since what changed is what a reviewer scans for first. Third:
 * which system it affects, and who requested it. Hidden until opened: agent version, model
 * version, run id, time zone detail. Never hidden: the environment." The system name moving
 * out of the first tier doesn't remove it from "never hidden" — it's still always visible,
 * just no longer sharing a row with environment/status.
 *
 * Environment stays a plain `Tag` — colour-neutral, since a deployment environment is not a
 * claim about a policy check (`StatusBadge`'s domain). Status now uses `StatusBadge` for
 * exactly the two outcomes that have a verified fill token (`approved` → success/green,
 * `changes_requested` → warning/amber, docs/DECISIONS.md) — every other status
 * (`running`/`blocked`/`awaiting_review`/`rejected`) stays on the neutral `Tag`, since no
 * colour was verified or shown in the mockup for those; inventing one wasn't part of what
 * was asked.
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

const STATUS_BADGE_TONE: Partial<Record<Run['status'], StatusBadgeTone>> = {
  approved: 'success',
  changes_requested: 'warning',
}

/** Only for the statuses that fall back to a plain `Tag` — `Tag` always needs an icon,
 * unlike `StatusBadge`, which has one built in per tone. */
const STATUS_ICON: Partial<Record<Run['status'], ComponentType<{ className?: string }>>> = {
  running: Loader2,
  blocked: OctagonAlert,
  awaiting_review: Eye,
  rejected: CircleX,
}

export interface RunHeaderProps {
  run: Run
}

export function RunHeader({ run }: RunHeaderProps) {
  const zone = formatTimeZoneLabel()
  const statusTone = STATUS_BADGE_TONE[run.status]

  return (
    <RegionCard as="header" className="flex flex-col gap-[var(--space-3)]">
      {/* First tier — never scrolled to, never hidden behind a disclosure. */}
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <Tag icon={ENVIRONMENT_ICON[run.target.environment]}>
          {ENVIRONMENT_LABEL[run.target.environment]}
        </Tag>
        {statusTone ? (
          <StatusBadge tone={statusTone} label={formatRunStatusLabel(run.status)} />
        ) : (
          <Tag icon={STATUS_ICON[run.status]!}>{formatRunStatusLabel(run.status)}</Tag>
        )}
      </div>

      {/* Second tier — the headline. Truncated only at md and up: below that, the `title`
       * tooltip this relies on to reveal the rest never fires on a touchscreen, which would
       * otherwise silently hide "what was asked for" — the first reviewer question
       * (docs/spec-review-screen.md) — with no way to read it. */}
      <h2
        id="run-header-heading"
        className="text-page-title min-w-0 font-bold text-text-primary md:truncate"
        title={run.initiative}
      >
        {run.initiative}
      </h2>

      {/* Third tier: which system, then a divider, then when, then a divider, then who —
       * matching the mockup's card rhythm. The requester keeps its own line rather than
       * being folded into a sentence: a pill (ActorName) clipped mid-shape by a truncating
       * neighbour would look broken, and every other place a person's name appears already
       * gets its own line or clause rather than being buried inside running text. */}
      <p className="text-body font-normal font-body text-text-secondary">
        <span className="font-semibold text-text-primary">Affects:</span> {run.target.system}
      </p>

      <hr className="border-border-subtle" />

      <div className="flex flex-col gap-[var(--space-2)]">
        <p className="text-body font-normal font-body text-text-secondary">
          <span className="font-semibold text-text-primary">Started</span>{' '}
          {formatDateTime(run.startedAt)} ({formatRelativeTime(run.startedAt)})
          {zone && ` ${zone}`}
        </p>
        {run.finishedAt && (
          <p className="text-body font-normal font-body text-text-secondary">
            <span className="font-semibold text-text-primary">Finished</span>{' '}
            {formatDateTime(run.finishedAt)} ({formatRelativeTime(run.finishedAt)})
          </p>
        )}
      </div>

      <hr className="border-border-subtle" />

      {/* "Requested by [pill]" and "Show details" live inside the one `<summary>` row (not
       * as two independent flex siblings) specifically so the revealed content below can be a
       * full-width block instead of being squeezed into a `w-fit` column under the trigger
       * alone — a real, not just cosmetic, difference: the old layout visually clipped the
       * Agent/Model/Run ID/Time zone list into a narrow right-aligned box. `summaryClassName`/
       * `contentClassName` strip Disclosure's own default padding, since `RegionCard` already
       * supplies the card's padding and a second inset would misalign this row against every
       * other row above it. */}
      <Disclosure
        className="border-none bg-transparent"
        summaryClassName="px-0 py-0"
        contentClassName="px-0 pt-[var(--space-3)] pb-0"
        summary={
          <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
            <p className="text-body flex flex-wrap items-center gap-x-[var(--space-1)] font-normal font-body text-text-secondary">
              <span className="font-semibold text-text-primary">Requested by</span>{' '}
              <ActorName name={run.requestedBy} />
            </p>
            <span className="text-body font-normal font-body text-text-secondary">
              Show details
            </span>
          </div>
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
