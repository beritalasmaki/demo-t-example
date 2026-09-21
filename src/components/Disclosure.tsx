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
      {/*
       * Native `<details>` applies `display: none` to its children the instant `open` goes
       * false — before any CSS transition can run — so animating open/close means never
       * letting the browser do that hiding itself. `open` still genuinely toggles (screen
       * readers get the real expanded/collapsed state); the *visual* collapse is entirely
       * this grid row animating between `0fr` and `1fr`, independent of `display`. The
       * `overflow-hidden` div is what lets a grid item actually shrink past its content's own
       * height down to the `0fr` track — a plain `<div>` with no `overflow` set can't.
       * Opening gets a small, springy overshoot; closing stays quick and plain, per
       * tokens.css's Motion block — deliberately not reused for status/decision motion.
       */}
      <div
        className={cn(
          'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity]',
          'duration-[var(--motion-duration-close)] ease-[var(--motion-ease-in)]',
          '[details[open]_&]:grid-rows-[1fr] [details[open]_&]:opacity-100',
          '[details[open]_&]:duration-[var(--motion-duration-open)]',
          '[details[open]_&]:ease-[var(--motion-ease-spring)]',
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border-subtle px-[var(--space-4)] py-[var(--space-3)]">
            {children}
          </div>
        </div>
      </div>
    </details>
  )
}
