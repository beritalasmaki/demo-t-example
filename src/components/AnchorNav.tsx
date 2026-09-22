import type { ComponentType } from 'react'
import { IconText } from './IconText'
import { cn } from '../lib/utils'

/**
 * A list of in-page anchor links — quick jumps to named sections further down the same page.
 * Knows nothing about runs or regions; the caller supplies which sections exist
 * (`features/run/RunReviewPage.tsx` supplies this screen's six regions). No "currently
 * viewing" highlight (no scroll-spy) — this is quick links, not a table of contents that
 * tracks scroll position, which is real added complexity beyond what was asked.
 *
 * Below `md` (docs/spec-review-screen.md, "Out of scope"): a horizontal, scrollable strip
 * above the content, not sticky — `RunReviewPage.tsx`'s outer container stacks it above the
 * content column at that width, which is what puts it "at the top" on a phone-width screen.
 * `md` and up: today's sticky vertical column, unchanged.
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
        'flex gap-[var(--space-1)] overflow-x-auto',
        'md:sticky md:top-[var(--space-5)] md:w-44 md:shrink-0 md:flex-col md:self-start md:overflow-visible',
        className,
      )}
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="shrink-0 rounded-md px-[var(--space-2)] py-[var(--space-1)] text-body font-normal font-body text-text-secondary hover:bg-surface-raised hover:text-text-primary"
        >
          <IconText icon={item.icon}>{item.label}</IconText>
        </a>
      ))}
    </nav>
  )
}
