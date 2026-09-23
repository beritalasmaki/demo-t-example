import type { ComponentType, ReactNode } from 'react'
import { cn } from '../../lib/utils'

/**
 * The page's region heading: `--text-section-heading` with a leading icon for quick scanning.
 * The icon is violet by default; a heading about things left open ("What is not checked") passes
 * the warning colour instead. `id` is what the region's `aria-labelledby` points at.
 */
export interface SectionHeadingProps {
  id: string
  icon: ComponentType<{ className?: string }>
  children: ReactNode
  iconClassName?: string
  className?: string
}

export function SectionHeading({
  id,
  icon: Icon,
  children,
  iconClassName,
  className,
}: SectionHeadingProps) {
  return (
    <h2
      id={id}
      className={cn(
        'flex items-center gap-[var(--space-3)] text-section-heading leading-tight font-semibold font-heading text-text-primary',
        className,
      )}
    >
      <Icon aria-hidden className={cn('h-5 w-5 shrink-0 text-primary', iconClassName)} />
      {children}
    </h2>
  )
}
