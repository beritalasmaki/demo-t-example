import type { ComponentType } from 'react'
import { cn } from '../lib/utils'

/**
 * A small circular badge around an icon — the shared shape a person icon and a system icon
 * both sit in, so "who did this" reads as one consistent visual language regardless of which
 * of the two it is. Knows nothing about people or systems specifically; the caller picks the
 * icon (see `features/run/`'s `actorIcon`, built on `lib/actors.ts`'s `isSystemActor`).
 */
export interface ActorIconProps {
  icon: ComponentType<{ className?: string }>
  className?: string
}

export function ActorIcon({ icon: Icon, className }: ActorIconProps) {
  return (
    <span
      className={cn(
        // Border only, no fill: this sits on `bg-surface`, `bg-surface-raised` and
        // `bg-surface-raised` again (the waiver callout, evaluated-by line and decided-view
        // panel) — a filled circle would only read against some of those. `border-border`
        // (not the subtler `border-border-subtle` most row borders use) so the ring itself
        // stays visible on every one of them.
        'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border',
        className,
      )}
    >
      <Icon aria-hidden className="h-3 w-3 text-text-secondary" />
    </span>
  )
}
