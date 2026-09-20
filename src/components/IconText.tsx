import type { ComponentType } from 'react'
import { cn } from '../lib/utils'

/**
 * A plain icon + label pairing — no pill, no background, no colour semantics of its own.
 * Distinct from `StatusBadge`: that component owns a fixed set of status colours and always
 * means "here is a result". This one means nothing on its own; the caller decides what the
 * icon is and, optionally, what colour it takes via `iconClassName`.
 */
export interface IconTextProps {
  icon: ComponentType<{ className?: string }>
  children: React.ReactNode
  /** Applied to the icon only — e.g. a colour class. Text colour is unaffected. */
  iconClassName?: string
  className?: string
}

export function IconText({ icon: Icon, children, iconClassName, className }: IconTextProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <Icon aria-hidden className={cn('h-4 w-4 shrink-0', iconClassName)} />
      {children}
    </span>
  )
}
