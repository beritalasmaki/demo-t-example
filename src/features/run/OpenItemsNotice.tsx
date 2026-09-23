import { buildOpenItems } from '../../lib/openItems'
import type { Run } from '../../lib/types'

/**
 * How many things are open before a decision, at the right end of the page's top bar: a
 * yellow dot, "3 things to solve" and a link to the tick list in the decision panel
 * (docs/DECISIONS.md, 0053). Nothing when nothing is open — the decision panel says so itself.
 * After a decision the page does not show it.
 */
export interface OpenItemsNoticeProps {
  run: Run
  /** Where "Jump to the open items" goes — the tick list in the decision panel. */
  href?: string
}

export function OpenItemsNotice({ run, href = '#open-items' }: OpenItemsNoticeProps) {
  const count = buildOpenItems(run).length
  if (count === 0) return null

  return (
    <p className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[var(--space-1)] text-meta font-body">
      <span className="inline-flex items-center gap-[var(--space-2)] font-semibold text-text-primary">
        <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full bg-status-waived-dot" />
        {count === 1 ? '1 thing to solve' : `${count} things to solve`}
      </span>
      <a
        href={href}
        className="font-medium whitespace-nowrap text-primary no-underline underline-offset-2 hover:underline"
      >
        Jump to the open items →
      </a>
    </p>
  )
}
