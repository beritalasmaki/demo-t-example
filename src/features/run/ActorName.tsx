import { Bot, User } from 'lucide-react'
import { ActorIcon } from '../../components/ActorIcon'
import { isSystemActor } from '../../lib/actors'
import { cn } from '../../lib/utils'

/**
 * Content rules, "Who did what": "a person by name, or a system by name and version." A
 * person's name gets a pill — border, filled background, the icon inset at its edge — so a
 * human decision or evaluation reads as visually distinct at a glance, not only via the small
 * `ActorIcon` next to it. A system's name-and-version stays plain icon + text: the pill is
 * specifically what marks "a person did this," so a system never gets one — same
 * icon-choosing heuristic (`isSystemActor`, `lib/actors.ts`) either way, just different chrome
 * for the two outcomes. Every place an actor's name appears (`PolicyGateRow.tsx`'s
 * `evaluatedBy`/`waiver.by`, `DecisionBar.tsx` and `DecisionStatusBanner.tsx`'s
 * `decision.by`) uses this one component, rather than each repeating the same two branches.
 */
export interface ActorNameProps {
  name: string
  className?: string
}

export function ActorName({ name, className }: ActorNameProps) {
  if (isSystemActor(name)) {
    return (
      <span className={cn('inline-flex items-center gap-[var(--space-2)]', className)}>
        <ActorIcon icon={Bot} />
        {name}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-[var(--space-2)] rounded-full border border-border-subtle bg-surface-raised py-[var(--space-1)] pl-[var(--space-1)] pr-[var(--space-3)]',
        className,
      )}
    >
      <ActorIcon icon={User} />
      {name}
    </span>
  )
}
