import { Tabs as TabsPrimitive } from 'radix-ui'
import type { ComponentType, ReactNode } from 'react'
import { cn } from '../lib/utils'

/**
 * A real ARIA tabs widget (`role="tablist"`/`"tab"`/`"tabpanel"`, arrow-key navigation between
 * triggers) built on `radix-ui`'s `Tabs` primitive rather than a hand-rolled toggle, the same
 * reasoning as `Disclosure` using native `<details>` — the correct keyboard behaviour and
 * assistive-tech semantics come for free. Knows nothing about policy gates or any other
 * product concept; `value`/`onValueChange` are the caller's, same shape as
 * `TabsPrimitive.Root`.
 */
export interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
  className?: string
  /** `automatic` (default): arrow keys select as they move. `manual`: arrow keys only move
   * focus, and Enter, Space or a click selects. Use `manual` when selecting a tab moves focus
   * into its panel — otherwise arrowing along the tab list would pull focus out of it. */
  activationMode?: 'automatic' | 'manual'
}

export function Tabs({
  value,
  onValueChange,
  children,
  className,
  activationMode = 'automatic',
}: TabsProps) {
  return (
    <TabsPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      activationMode={activationMode}
      className={className}
    >
      {children}
    </TabsPrimitive.Root>
  )
}

/** `segmented`: the full-width bar described below. `pill`: a compact rounded track whose
 * selected tab is a raised white pill — for a small set of views in a toolbar, where a
 * full-width bar would dominate. */
export type TabsVariant = 'segmented' | 'pill'

export interface TabsListProps {
  children: ReactNode
  className?: string
  variant?: TabsVariant
  /** Names the tab list for assistive tech when there is no visible heading for it. */
  label?: string
}

/** A full-width segmented bar (each trigger fills an equal share of the row, not a small
 * underlined text-link row) — the tab itself carries the "selected" affordance via its own
 * fill colour, divided from its neighbour by a vertical rule and from the row above/below by
 * a horizontal one. No rounding or side borders by default: the usual placement is edge-to-
 * edge inside a card that already has its own border, and a caller wanting the bar to bleed
 * to that card's outer edge supplies its own negative margin (this component doesn't assume
 * a specific parent padding value). */
export function TabsList({ children, className, variant = 'segmented', label }: TabsListProps) {
  return (
    <TabsPrimitive.List
      aria-label={label}
      className={cn(
        variant === 'segmented'
          ? 'flex divide-x divide-border-subtle border-y border-border-subtle'
          : 'inline-flex gap-[var(--space-1)] rounded-full bg-surface-raised p-[var(--space-1)]',
        className,
      )}
    >
      {children}
    </TabsPrimitive.List>
  )
}

export interface TabsTriggerProps {
  value: string
  children: ReactNode
  /** Shown before the label — every tab in this design carries one, unlike a plain text-link
   * tab. Colour is the caller's call via `iconClassName` (e.g. reusing `StatusBadge`'s own
   * "passed" green for a "settled" tab), since this component knows nothing about what the
   * icon means. */
  icon?: ComponentType<{ className?: string }>
  iconClassName?: string
  className?: string
  /** Must match the `TabsList` it sits in. */
  variant?: TabsVariant
}

const PILL_TRIGGER =
  'inline-flex cursor-pointer items-center gap-[var(--space-2)] whitespace-nowrap rounded-full px-[var(--space-4)] py-[var(--space-2)] ' +
  'text-meta font-semibold font-heading leading-none text-text-secondary transition-colors duration-[var(--motion-duration-fast)] ' +
  'hover:text-text-primary data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring'

export function TabsTrigger({
  value,
  children,
  icon: Icon,
  iconClassName,
  className,
  variant = 'segmented',
}: TabsTriggerProps) {
  if (variant === 'pill') {
    return (
      <TabsPrimitive.Trigger value={value} className={cn(PILL_TRIGGER, className)}>
        {Icon && <Icon aria-hidden className={cn('h-4 w-4 shrink-0', iconClassName)} />}
        {children}
      </TabsPrimitive.Trigger>
    )
  }
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        'flex flex-1 cursor-pointer items-center justify-center gap-[var(--space-2)] px-[var(--space-5)] py-[var(--space-3)]',
        'text-item-title font-semibold font-body text-text-secondary underline-offset-4 transition-colors',
        'duration-[var(--motion-duration-fast)] bg-surface-raised hover:underline',
        'data-[state=active]:bg-surface data-[state=active]:text-text-primary',
        'focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2',
        'focus-visible:outline-offset-[-2px] focus-visible:outline-focus-ring',
        className,
      )}
    >
      {Icon && <Icon aria-hidden className={cn('h-4 w-4 shrink-0', iconClassName)} />}
      {children}
    </TabsPrimitive.Trigger>
  )
}

export interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  return (
    <TabsPrimitive.Content value={value} className={className}>
      {children}
    </TabsPrimitive.Content>
  )
}
