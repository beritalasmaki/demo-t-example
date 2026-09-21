import type { ComponentType } from 'react'
import { IconText } from './IconText'
import { cn } from '../lib/utils'

/**
 * A neutral icon+label pill. Distinct from `StatusBadge`: that component owns a fixed set of
 * status colours and always means "here is a pass/fail/waived/not_applicable/unknown result."
 * `Tag` carries no colour semantics of its own — distinctness comes from the icon shape and
 * the exact label text, not colour. Use it for things that are not a claim about a policy
 * check (a workflow state, a category, an environment) but still need "icon + text, never
 * colour alone" (AGENTS.md non-negotiable 4).
 */
export interface TagProps {
  icon: ComponentType<{ className?: string }>
  children: React.ReactNode
  className?: string
}

export function Tag({ icon, children, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[var(--space-2)] rounded-full border border-border-subtle bg-surface-raised px-[var(--space-3)] py-[var(--space-1)] text-sm font-medium text-text-primary',
        className,
      )}
    >
      <IconText icon={icon}>{children}</IconText>
    </span>
  )
}
