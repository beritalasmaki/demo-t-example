import { ArrowRightLeft, Check, Clock, X } from 'lucide-react'
import type { ComponentType } from 'react'
import type { ReviewStage, ReviewStatus } from '../../lib/reviews'
import { STAGE_STEP, formatReviewStatus } from '../../lib/reviews'
import type { Run } from '../../lib/types'
import { cn } from '../../lib/utils'

/**
 * The small pieces My reviews repeats in every row (docs/DECISIONS.md, 0060): the run-type
 * pill, the environment chip and the three-step progress of a pending run. Status is always
 * an icon and a word, never colour alone.
 */

const PILL: Record<ReviewStatus, { icon: ComponentType<{ className?: string }>; tone: string }> = {
  pending: { icon: Clock, tone: 'bg-status-waived-tint-bg text-status-waived-tint-fg' },
  requested: { icon: ArrowRightLeft, tone: 'bg-status-info-tint-bg text-status-info-tint-fg' },
  declined: { icon: X, tone: 'bg-status-fail-tint-bg text-status-fail-tint-fg' },
  approved: { icon: Check, tone: 'bg-status-pass-tint-bg text-status-pass-tint-fg' },
}

export function ReviewStatusPill({ status, label }: { status: ReviewStatus; label?: string }) {
  const { icon: Icon, tone } = PILL[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[var(--space-2)] justify-self-start rounded-full py-[var(--space-1)] pr-[var(--space-3)] pl-[var(--space-2)]',
        'text-caption leading-snug font-semibold font-heading whitespace-nowrap',
        tone,
      )}
    >
      <Icon aria-hidden className="h-3.5 w-3.5 shrink-0" />
      {label ?? formatReviewStatus(status)}
    </span>
  )
}

/** "PRODUCTION" with a red dot, "STAGING" with a grey one: the word carries it, not the dot. */
export function EnvironmentChip({ environment }: { environment: Run['target']['environment'] }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-[var(--space-1)] rounded-full border border-border px-[var(--space-2)] text-caption leading-snug font-semibold font-heading tracking-wide whitespace-nowrap text-text-primary uppercase">
      <span
        aria-hidden
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          environment === 'production' ? 'bg-status-fail' : 'bg-border',
        )}
      />
      {environment}
    </span>
  )
}

/** Three short bars: done steps in the brand colour, the current one lighter, or amber when
 * it is the reviewer's turn. Decorative next to the stage's own words. */
export function StageSteps({ stage, className }: { stage: ReviewStage; className?: string }) {
  const step = STAGE_STEP[stage]
  return (
    <span aria-hidden className={cn('flex w-24 gap-[var(--space-1)]', className)}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={cn(
            'h-1.5 flex-1 rounded-full',
            n < step
              ? 'bg-primary'
              : n === step
                ? stage === 'review'
                  ? 'bg-status-waived'
                  : 'bg-primary/50'
                : 'bg-border-subtle',
          )}
        />
      ))}
    </span>
  )
}

/** The run's name as a link to its review, with its reference, service and environment. */
export function RunCell({ run, href }: { run: Run; href: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
      <a
        href={href}
        title={run.initiative}
        className="truncate text-body leading-snug font-semibold font-body text-text-primary no-underline hover:text-primary hover:underline"
      >
        {run.initiative}
      </a>
      <span className="flex min-w-0 items-center gap-[var(--space-2)] overflow-hidden text-caption whitespace-nowrap text-text-secondary">
        <span className="shrink-0 font-mono">{run.id}</span>
        <span aria-hidden className="text-text-secondary">
          ·
        </span>
        <span className="min-w-0 truncate">{run.target.system}</span>
        <EnvironmentChip environment={run.target.environment} />
      </span>
    </div>
  )
}
