import { ArrowRight } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { cn } from '../lib/utils'

/**
 * A secondary-action link — "See policy gates →", "Evidence (2) →", "◎ View the decision
 * details" — styled quieter than the primary content next to it (neutral secondary colour,
 * no underline) since the icon and position already mark it as an action, not running text.
 * Knows nothing about runs, evidence or decisions; the caller supplies the label and where it
 * points. Replaces `EvidenceLink` (retired — this covers the same "Evidence (N)" case via
 * plain children, plus the icon-leading and no-count cases `EvidenceLink` couldn't).
 */
export interface ActionLinkProps {
  href: string
  children: ReactNode
  /** Defaults to a trailing arrow — the shape used by `AttentionDigest` and `RunSummary`'s
   * evidence links. Pass a different icon with `iconPosition="start"` for a leading-icon link
   * instead, e.g. `DecisionStatusBanner`'s "View the decision details". */
  icon?: ComponentType<{ className?: string }>
  iconPosition?: 'start' | 'end'
  className?: string
}

export function ActionLink({
  href,
  children,
  icon: Icon = ArrowRight,
  iconPosition = 'end',
  className,
}: ActionLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'inline-flex w-fit shrink-0 items-center gap-[var(--space-1)] text-body font-normal font-body text-text-secondary hover:text-text-primary',
        className,
      )}
    >
      {iconPosition === 'start' && <Icon aria-hidden className="h-4 w-4 shrink-0" />}
      {children}
      {iconPosition === 'end' && <Icon aria-hidden className="h-4 w-4 shrink-0" />}
    </a>
  )
}
