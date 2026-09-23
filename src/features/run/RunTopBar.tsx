import { ChevronLeft } from 'lucide-react'
import type { ReactNode, Ref } from 'react'
import type { Run } from '../../lib/types'

/**
 * The page's own bar, directly under the host platform's navigation: a breadcrumb back to the
 * reviewer's list, and at its right end what is open before a decision (0053) and the
 * maker's mark, "By Berit" (0057). The three views of the run sit above the view they switch, in
 * `RunViewTabs` (docs/DECISIONS.md, 0052). No product logo, no main menu — this page sits
 * inside another platform that owns those (docs/DECISIONS.md, 0042); the maker's mark is a
 * byline, not a product name. A long initiative name
 * truncates with the full name on hover; the revision chip next to it never truncates, so two
 * runs of the same initiative stay distinguishable.
 *
 * Sticky at the top of the page, so the way back is always one click away
 * (docs/DECISIONS.md, 0044). `ref` lets the page measure its height, so headings scrolled to,
 * the view tabs and the sticky side column stay clear of it.
 */
export interface RunTopBarProps {
  run: Run
  reviewsHref: string
  /** Shown at the right end of the bar — the page puts what is open there before a decision
   * (docs/DECISIONS.md, 0053). */
  end?: ReactNode
  ref?: Ref<HTMLDivElement>
}

/** The maker's mark at the bar's far right (docs/DECISIONS.md, 0057). The heart is the
 * signature orange, as text (U+2764 with the text-style selector, so it takes the colour and
 * is not drawn as an emoji). It is decoration, so it is hidden from screen readers. */
function Byline() {
  return (
    <span className="inline-flex items-center gap-[var(--space-1)] text-meta font-semibold font-heading whitespace-nowrap text-text-primary">
      By Berit
      <span aria-hidden className="text-signature">
        {'\u2764\uFE0E'}
      </span>
    </span>
  )
}

export function RunTopBar({ run, reviewsHref, end, ref }: RunTopBarProps) {
  return (
    <div ref={ref} className="sticky top-0 z-20 border-b border-border-subtle bg-surface">
      <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-x-[var(--space-5)] gap-y-[var(--space-2)] px-[var(--space-4)] py-[var(--space-3)] md:px-[var(--space-6)]">
        <nav aria-label="Breadcrumb" className="min-w-0 flex-1 md:flex-none">
          <ol className="flex min-w-0 items-center gap-[var(--space-2)] text-meta font-normal font-body text-text-secondary">
            <li className="shrink-0">
              <a
                href={reviewsHref}
                className="inline-flex items-center gap-[var(--space-1)] whitespace-nowrap text-primary no-underline underline-offset-2 hover:underline"
              >
                <ChevronLeft aria-hidden className="h-4 w-4" />
                My reviews
              </a>
            </li>
            <li aria-hidden className="text-border">
              ›
            </li>
            <li className="flex min-w-0 items-center gap-[var(--space-2)]" aria-current="page">
              <span title={run.initiative} className="max-w-[22.5rem] truncate text-text-primary">
                {run.initiative}
              </span>
              <span className="shrink-0 rounded-sm border border-border-subtle bg-surface-raised px-[var(--space-2)] py-[var(--space-1)] font-mono text-caption leading-none font-medium whitespace-nowrap text-text-secondary">
                {run.revision}
              </span>
            </li>
          </ol>
        </nav>
        {/* Narrow screens: the mark shares the breadcrumb's row, and what is open takes a row
            of its own under them. From md: breadcrumb | what is open, mark. */}
        {end != null && (
          <div className="order-last w-full md:order-none md:ml-auto md:w-auto">{end}</div>
        )}
        <Byline />
      </div>
    </div>
  )
}
