import { ChevronLeft } from 'lucide-react'
import type { Ref } from 'react'
import { TabsList, TabsTrigger } from '../../components/Tabs'
import { formatCount } from '../../lib/format'
import type { Run } from '../../lib/types'

/**
 * The page's own bar, directly under the host platform's navigation: a breadcrumb back to the
 * reviewer's list, and the three views of the run. No logo, no main menu — this page sits
 * inside another platform that owns those (docs/DECISIONS.md, 0042). A long initiative name
 * truncates with the full name on hover; the revision chip next to it never truncates, so two
 * runs of the same initiative stay distinguishable.
 *
 * Must render inside the page's `Tabs` root: the tab list lives here, the tab panels in the
 * main column.
 *
 * Sticky at the top of the page, so the views can be switched from anywhere in a long run
 * (docs/DECISIONS.md, 0044). `ref` lets the page measure its height, so headings scrolled to
 * and the sticky right column stay clear of it.
 */
export interface RunTopBarProps {
  run: Run
  reviewsHref: string
  ref?: Ref<HTMLDivElement>
}

export function RunTopBar({ run, reviewsHref, ref }: RunTopBarProps) {
  return (
    <div ref={ref} className="sticky top-0 z-20 border-b border-border-subtle bg-surface">
      <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-x-[var(--space-5)] gap-y-[var(--space-3)] px-[var(--space-4)] py-[var(--space-3)] md:px-[var(--space-6)]">
        <nav aria-label="Breadcrumb" className="w-full min-w-0 md:w-auto">
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
        <TabsList variant="pill" label="Views of this run">
          <TabsTrigger variant="pill" value="story">
            Story
          </TabsTrigger>
          <TabsTrigger variant="pill" value="evidence">
            Evidence
          </TabsTrigger>
          <TabsTrigger variant="pill" value="steps">
            All {formatCount(run.timeline.length, 'step')}
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  )
}
