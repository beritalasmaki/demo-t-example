import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

/**
 * A generic expand/collapse row, built on native `<details>`/`<summary>` rather than custom
 * JS. That gets keyboard operation and "focus stays where it was" for free from the browser:
 * `<summary>` is natively focusable and toggling it never moves focus elsewhere. Knows
 * nothing about policy gates or any other product concept — reusable wherever something
 * needs to be collapsed but never hidden (the audit log/timeline will want the same pattern).
 */
export interface DisclosureProps {
  /** The always-visible header. Rendered inside the native `<summary>`, so it is the part a
   * keyboard or screen-reader user activates to open and close the row. */
  summary: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

export function Disclosure({ summary, children, defaultOpen = false, className }: DisclosureProps) {
  return (
    <details
      open={defaultOpen}
      className={cn('rounded-md border border-border-subtle bg-surface', className)}
    >
      <summary
        className={cn(
          'flex cursor-pointer list-none items-center justify-between gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-3)]',
          '[&::-webkit-details-marker]:hidden',
        )}
      >
        <div className="min-w-0 flex-1">{summary}</div>
        <ChevronDown
          aria-hidden
          className="h-4 w-4 shrink-0 text-text-secondary transition-transform duration-[var(--motion-duration-fast)] [details[open]_&]:rotate-180"
        />
      </summary>
      <div className="border-t border-border-subtle px-[var(--space-4)] py-[var(--space-3)]">
        {children}
      </div>
    </details>
  )
}
