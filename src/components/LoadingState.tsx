import { ThinkingOrb } from 'thinking-orbs'
import { cn } from '../lib/utils'

/**
 * A loading state: the `thinking-orbs` "working" orb with a short label under it, centred in
 * the space it is given — by default the full screen height, as a page's only content
 * (docs/DECISIONS.md, 0050). Knows nothing about runs — the caller
 * supplies the words.
 *
 * The label is the accessible status (`role="status"`), so the orb itself is `aria-hidden`:
 * its own default label would otherwise be read out as well. The orb follows the app's
 * `data-theme` and the system colour scheme by itself, and shows a still frame for
 * `prefers-reduced-motion: reduce`.
 */
export interface LoadingStateProps {
  label: string
  className?: string
}

export function LoadingState({ label, className }: LoadingStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex min-h-dvh flex-col items-center justify-center gap-[var(--space-3)] p-[var(--space-6)]',
        className,
      )}
    >
      <ThinkingOrb state="working" size={64} aria-hidden="true" />
      <p className="text-body font-normal font-body text-text-secondary">{label}</p>
    </div>
  )
}
