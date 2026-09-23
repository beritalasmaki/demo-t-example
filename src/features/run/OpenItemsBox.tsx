import { buildOpenItems, describeOpenItems } from '../../lib/openItems'
import type { Run } from '../../lib/types'

/**
 * The top of the right-hand column before a decision: how many things are open, in one
 * sentence, with a link to the tick list just below it. After a decision `UndoBox` takes this
 * place (docs/DECISIONS.md, 0046).
 */
export interface OpenItemsBoxProps {
  run: Run
  /** Where "Jump to the open items" goes — the tick list in the decision panel. */
  href?: string
}

export function OpenItemsBox({ run, href = '#open-items' }: OpenItemsBoxProps) {
  const count = buildOpenItems(run).length

  if (count === 0) {
    return (
      <div className="flex flex-col gap-[var(--space-2)] rounded-lg border border-border-subtle bg-surface p-[var(--space-4)]">
        <span className="text-meta font-semibold font-heading text-text-primary">
          Nothing is open
        </span>
        <span className="text-meta font-normal font-body leading-relaxed text-text-primary">
          No check failed or was left without a result, and no score is low. Read the run, then
          decide.
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[var(--space-2)] rounded-lg border border-status-waived/40 bg-status-waived-tint-bg p-[var(--space-4)]">
      <span className="text-meta font-semibold font-heading text-text-primary">
        {count === 1 ? '1 thing is open' : `${count} things are open`}
      </span>
      <span className="text-meta font-normal font-body leading-relaxed text-text-primary">
        {describeOpenItems(run)}
      </span>
      <a
        href={href}
        className="text-meta font-medium font-body text-primary no-underline underline-offset-2 hover:underline"
      >
        Jump to the open items →
      </a>
    </div>
  )
}
