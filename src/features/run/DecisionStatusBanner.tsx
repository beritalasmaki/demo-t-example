import { CircleCheckBig, CircleX, RotateCcw } from 'lucide-react'
import type { ComponentType } from 'react'
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
 * Colour-neutral, not `--color-status-*`, for the same reason `RunHeader.tsx` gives `RunStatus`
 * a neutral `Tag` rather than a status colour: neither is a claim about a policy check (a
 * `GateResult`), which is what that palette is reserved for (src/styles/README.md).
 */
const OUTCOME_ICON: Record<Decision['outcome'], ComponentType<{ className?: string }>> = {
  approved: CircleCheckBig,
  changes_requested: RotateCcw,
  rejected: CircleX,
}

export interface DecisionStatusBannerProps {
  decision: Decision
}

export function DecisionStatusBanner({ decision }: DecisionStatusBannerProps) {
  return (
    <RegionCard className="flex flex-col gap-[var(--space-1)]">
      <p className="text-body font-normal font-body text-text-primary">
        <IconText icon={OUTCOME_ICON[decision.outcome]}>
          <span className="font-semibold">{formatDecisionOutcomeLabel(decision.outcome)}</span>
        </IconText>{' '}
        by <ActorName name={decision.by} /> · {formatRelativeTime(decision.at)}
      </p>
      <p className="text-body font-normal font-body text-text-secondary">
        This decision already stands.{' '}
        <a
          href="#decision-heading"
          className="text-primary underline decoration-1 underline-offset-2 hover:text-primary-hover"
        >
          See the decision, and undo it if needed
        </a>
      </p>
    </RegionCard>
  )
}
