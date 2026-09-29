import { cn } from '../lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

/**
 * A small "i" button that explains the label next to it, on shadcn/ui's Tooltip (Radix —
 * docs/DECISIONS.md, 0070): the text shows on hover and on keyboard focus, and screen readers
 * hear it as the button's description. Escape hides it without moving the pointer, and it
 * stays inside the window on its own (WCAG 1.4.13).
 */
export interface InfoTipProps {
  /** What the tip is about — the button reads "About <label>". */
  label: string
  children: string
  /** `end`: the tip lines up with the button's right edge, for columns at the right edge. */
  align?: 'start' | 'end'
  className?: string
}

export function InfoTip({ label, children, align = 'start', className }: InfoTipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`About ${label}`}
          className={cn(
            'inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full',
            'border border-border bg-surface text-caption leading-none font-semibold font-heading text-text-secondary',
            'hover:border-primary hover:text-primary',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
            className,
          )}
        >
          i
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" align={align}>
        {children}
      </TooltipContent>
    </Tooltip>
  )
}
