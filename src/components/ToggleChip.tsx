import { cn } from '../lib/utils'

/**
 * A pressable filter chip — a real `<button aria-pressed>`, not a styled checkbox or a `<div
 * onClick>`. That gets keyboard operability (Tab to reach it, Enter/Space to toggle it) and
 * the correct assistive-tech state for free, the same reasoning as `Disclosure` using native
 * `<details>`. Reusable anywhere a multi-select filter or toggle needs a chip, not specific
 * to timeline event types.
 */
export interface ToggleChipProps {
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
  children: React.ReactNode
  className?: string
}

export function ToggleChip({ pressed, onPressedChange, children, className }: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        'inline-flex items-center gap-[var(--space-2)] rounded-full border px-[var(--space-3)] py-[var(--space-1)] text-sm font-medium transition-colors',
        `duration-[var(--motion-duration-fast)]`,
        pressed
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-surface text-text-secondary hover:border-text-secondary',
        className,
      )}
    >
      {children}
    </button>
  )
}
