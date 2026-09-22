import { CircleCheckBig, CircleX, Eye, RotateCcw } from 'lucide-react'
import type { ComponentType } from 'react'
import { ActionLink } from '../../components/ActionLink'
import { IconText } from '../../components/IconText'
import { RegionCard } from '../../components/RegionCard'
import { formatDecisionOutcomeLabel, formatRelativeTime } from '../../lib/format'
import type { Decision } from '../../lib/types'
import { ActorName } from './ActorName'

/**
 * A compact "this run is already decided" note, right under the run header — so a reviewer
 * who opens an already-decided run finds out immediately, not only after reading down to the
 * Decision region at the bottom. Purely a pointer to that region (never a second place a
 * decision is recorded): the full detail — who, when, revision, the undo window — stays in
 * `DecidedView` inside `DecisionBar.tsx`, this just links to it.
 *
 * Same icons as `RunHeader.tsx`'s own `STATUS_ICON` for these three `RunStatus` values,
 * kept as a small local map rather than sharing that one: it only needs three of its six
 * entries, and `Decision['outcome']` and `RunStatus` are different types that happen to share
 * these three string values, not the same type.
 *
 * The outcome icon (only) is coloured for `approved`/`changes_requested` — the same two tint
 * foregrounds `RunHeader.tsx`'s `StatusBadge` uses, for visual consistency with that badge —
 * but the surrounding text stays neutral and this never becomes a filled pill: unlike
 * `RunStatus` in the header, this line is a sentence, not a status chip, so only the "filled
 * badge" exception (docs/DECISIONS.md) applies, not a second, different exception for icon-
 * only colour in running text.
 */
const OUTCOME_ICON: Record<Decision['outcome'], ComponentType<{ className?: string }>> = {
  approved: CircleCheckBig,
  changes_requested: RotateCcw,
  rejected: CircleX,
}

const OUTCOME_ICON_CLASSNAME: Partial<Record<Decision['outcome'], string>> = {
  approved: 'text-status-pass-tint-fg',
  changes_requested: 'text-status-waived-tint-fg',
}

export interface DecisionStatusBannerProps {
  decision: Decision
}

export function DecisionStatusBanner({ decision }: DecisionStatusBannerProps) {
  return (
    <RegionCard className="flex flex-col gap-[var(--space-2)]">
      {/* A flex row, not a `<p>` with inline children: `ActorName`'s pill is `inline-flex`,
       * and mixing that with plain text inside a `<p>` aligns it to the text's baseline —
       * visibly off-center against "Approved by". A flex row's `items-center` aligns both by
       * their actual box centers instead. The timestamp is a separate flex item pushed to the
       * row's far right (`justify-between`), not folded into the same sentence. */}
      <div className="flex flex-wrap items-center justify-between gap-x-[var(--space-3)] gap-y-[var(--space-1)]">
        <p className="text-body flex flex-wrap items-center gap-x-[var(--space-1)] font-normal font-body text-text-primary">
          <IconText
            icon={OUTCOME_ICON[decision.outcome]}
            iconClassName={OUTCOME_ICON_CLASSNAME[decision.outcome]}
          >
            <span className="font-semibold">{formatDecisionOutcomeLabel(decision.outcome)}</span>
          </IconText>{' '}
          by <ActorName name={decision.by} />
        </p>
        <p className="text-body font-normal font-body text-text-secondary">
          {formatRelativeTime(decision.at)}
        </p>
      </div>

      <hr className="border-border-subtle" />

      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <p className="text-body font-normal font-body text-text-secondary">
          This decision already stands.
        </p>
        <ActionLink href="#decision-heading" icon={Eye} iconPosition="start">
          View the decision details
        </ActionLink>
      </div>
    </RegionCard>
  )
}
