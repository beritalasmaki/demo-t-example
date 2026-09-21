import { useId } from 'react'
import { cn } from '../lib/utils'

/**
 * A real `<input type="checkbox">` with its own `<label>`, not a styled `<div>` — keyboard
 * operation, the correct assistive-tech state, and a click target that includes the label
 * text all come from that for free, the same reasoning as `ToggleChip`'s real `<button>`.
 * Knows nothing about sign-offs or any other product concept.
 */
export interface CheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  children: React.ReactNode
  className?: string
}

export function Checkbox({ checked, onCheckedChange, children, className }: CheckboxProps) {
  const id = useId()

  return (
    <div className={cn('flex items-start gap-[var(--space-2)]', className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="mt-[var(--space-1)] h-4 w-4 shrink-0 rounded-sm border-border text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      />
      <label htmlFor={id} className="text-body font-normal font-body text-text-primary">
        {children}
      </label>
    </div>
  )
}
