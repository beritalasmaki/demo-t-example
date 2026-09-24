import { useId, useRef, useState } from 'react'
import { cn } from '../lib/utils'
import { keepTooltipInView } from './tooltipPlacement'

/**
 * A small "i" button that explains the label next to it: the text shows on hover and on
 * keyboard focus, and screen readers hear it as the button's description. Escape hides it
 * without moving the pointer (WCAG 1.4.13). Uses the same tooltip motion as the tab tooltips
 * (`.t-tt` in styles/transitions.css), in its wrapping form for a sentence or two.
 */
export interface InfoTipProps {
  /** What the tip is about — the button reads "About <label>". */
  label: string
  children: string
  /** `end`: the tip opens leftwards from the button, for columns at the right edge. */
  align?: 'start' | 'end'
  className?: string
}

export function InfoTip({ label, children, align = 'start', className }: InfoTipProps) {
  const tipId = useId()
  const tipRef = useRef<HTMLSpanElement>(null)
  const [dismissed, setDismissed] = useState(false)
  const keepInView = () => keepTooltipInView(tipRef.current)

  return (
    <span
      className={cn('t-tt-wrap', className)}
      data-dismissed={dismissed || undefined}
      onMouseEnter={keepInView}
      onMouseLeave={() => setDismissed(false)}
    >
      <button
        type="button"
        aria-label={`About ${label}`}
        aria-describedby={tipId}
        onFocus={keepInView}
        onBlur={() => setDismissed(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setDismissed(true)
        }}
        className={cn(
          't-tt-trigger inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full',
          'border border-border bg-surface text-caption leading-none font-semibold font-heading text-text-secondary',
          'hover:border-primary hover:text-primary',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        )}
      >
        i
      </button>
      <span
        ref={tipRef}
        id={tipId}
        role="tooltip"
        data-align={align}
        className="t-tt t-tt-wide text-caption font-normal font-body text-text-primary"
      >
        {children}
      </span>
    </span>
  )
}
