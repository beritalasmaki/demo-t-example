import type { ComponentType } from 'react'
import { IconText } from './IconText'
import { cn } from '../lib/utils'

/**
 * A sticky list of in-page anchor links — quick jumps to named sections further down the
 * same page. Knows nothing about runs or regions; the caller supplies which sections exist
 * (`features/run/RunReviewPage.tsx` supplies this screen's six regions). No "currently
 * viewing" highlight (no scroll-spy) — this is quick links, not a table of contents that
 * tracks scroll position, which is real added complexity beyond what was asked. No responsive
 * collapse either: mobile layouts are out of scope for this app (AGENTS.md).
 */
export interface AnchorNavItem {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
}

export interface AnchorNavProps {
  items: AnchorNavItem[]
  /** Read by screen readers as this landmark's name — not shown visually, so the page's own
   * heading hierarchy stays the one visible table of contents. */
  label: string
  className?: string
}

export function AnchorNav({ items, label, className }: AnchorNavProps) {
  return (
    <nav
      aria-label={label}
      className={cn(
        'sticky top-[var(--space-5)] flex w-44 shrink-0 flex-col gap-[var(--space-1)] self-start rounded-md border border-border-subtle bg-surface p-[var(--space-3)]',
        className,
      )}
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="rounded-md px-[var(--space-2)] py-[var(--space-1)] text-body font-normal font-body text-text-secondary hover:bg-surface-raised hover:text-text-primary"
        >
          <IconText icon={item.icon}>{item.label}</IconText>
        </a>
      ))}
    </nav>
  )
}
