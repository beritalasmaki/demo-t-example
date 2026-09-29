import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { cn } from '../lib/utils'
import { keepTooltipInView } from './tooltipPlacement'
import * as UI from './ui/tabs'

/**
 * A real ARIA tabs widget (`role="tablist"`/`"tab"`/`"tabpanel"`, arrow-key navigation between
 * triggers), on shadcn/ui's Tabs (`ui/tabs.tsx`, Radix — docs/DECISIONS.md, 0070), so the
 * correct keyboard behaviour and assistive-tech semantics come for free. This file adds what
 * shadcn's has not: the pill's sliding background, and a tooltip on a pill tab. Knows nothing about policy gates or any other
 * product concept; `value`/`onValueChange` are the caller's, same shape as
 * Radix's `Tabs.Root`.
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
    <UI.Tabs
      value={value}
      onValueChange={onValueChange}
      activationMode={activationMode}
      className={className}
    >
      {children}
    </UI.Tabs>
  )
}

/** `segmented`: the full-width bar described below. `pill`: a compact rounded track whose
 * selected tab is a raised white pill — for a small set of views in a toolbar, where a
 * full-width bar would dominate. `line`: text tabs on a rule, the selected one underlined in
 * the brand colour — for tabs that filter one list, each carrying its own icon and count
 * (docs/DECISIONS.md, 0060). */
export type TabsVariant = 'segmented' | 'pill' | 'line'

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
  if (variant === 'pill') {
    return (
      <PillTabsList className={className} label={label}>
        {children}
      </PillTabsList>
    )
  }
  if (variant === 'line') {
    return (
      <UI.TabsList variant="line" aria-label={label} className={className}>
        {children}
      </UI.TabsList>
    )
  }
  return (
    <UI.TabsList variant="segmented" aria-label={label} className={className}>
      {children}
    </UI.TabsList>
  )
}

/**
 * The pill variant's sliding background — transitions.dev "Tabs sliding"
 * (src/styles/transitions.css, docs/DECISIONS.md 0047). The active tab is measured and its
 * position and width written onto one pill behind the labels; CSS owns the tween. The first
 * placement, and any placement after a resize (a font finishing loading, a wrap), happens
 * without a transition, so the pill never slides in from the left edge. Watching `data-state`
 * means the pill follows every way a tab can become active: click, Enter, Space, or a caller
 * changing `value`.
 */
function PillTabsList({
  children,
  className,
  label,
}: {
  children: ReactNode
  className?: string
  label?: string
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const list = listRef.current
    const pill = pillRef.current
    if (!list || !pill) return

    function place(animate: boolean) {
      if (!list || !pill) return
      const active = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]')
      if (!active) {
        pill.style.opacity = '0'
        return
      }
      const listBox = list.getBoundingClientRect()
      const tabBox = active.getBoundingClientRect()
      const apply = () => {
        pill.style.transform = `translate(${tabBox.left - listBox.left}px, ${tabBox.top - listBox.top}px)`
        pill.style.width = `${tabBox.width}px`
        pill.style.height = `${tabBox.height}px`
        pill.style.opacity = '1'
      }
      if (animate) {
        apply()
        return
      }
      const previous = pill.style.transition
      pill.style.transition = 'none'
      apply()
      // Reading layout makes the browser commit the new position with no transition before
      // the transition comes back; without it both changes land together and the pill slides.
      void pill.offsetWidth
      pill.style.transition = previous
    }

    place(false)
    const mutations = new MutationObserver(() => place(true))
    mutations.observe(list, { attributes: true, attributeFilter: ['data-state'], subtree: true })
    const resizes =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => place(false))
    resizes?.observe(list)
    return () => {
      mutations.disconnect()
      resizes?.disconnect()
    }
  }, [])

  return (
    <UI.TabsList ref={listRef} variant="pill" aria-label={label} className={className}>
      <span ref={pillRef} aria-hidden className="t-tabs-pill rounded-full bg-surface shadow-sm" />
      {children}
    </UI.TabsList>
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
  /** Pill variant only: a short description shown on hover and keyboard focus —
   * transitions.dev "Tooltip open/close". Linked with `aria-describedby`, so screen readers
   * hear it too; Escape hides it without moving the pointer (WCAG 1.4.13). */
  tooltip?: string
}

function PillTrigger({
  value,
  children,
  icon: Icon,
  iconClassName,
  className,
  tooltip,
}: Omit<TabsTriggerProps, 'variant'>) {
  const tooltipId = useId()
  const [dismissed, setDismissed] = useState(false)
  const tooltipRef = useRef<HTMLSpanElement>(null)

  // Centred under its tab, the tooltip can run past the window's edge: the tab bar can sit
  // at the right of the page.
  const keepInView = () => keepTooltipInView(tooltipRef.current)
  const trigger = (
    <UI.TabsTrigger
      variant="pill"
      value={value}
      aria-describedby={tooltip ? tooltipId : undefined}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setDismissed(true)
      }}
      onBlur={() => setDismissed(false)}
      onFocus={keepInView}
      className={cn(tooltip && 't-tt-trigger', className)}
    >
      {Icon && <Icon aria-hidden className={cn('h-4 w-4 shrink-0', iconClassName)} />}
      {children}
    </UI.TabsTrigger>
  )
  if (!tooltip) return trigger
  return (
    <span
      className="t-tt-wrap"
      data-dismissed={dismissed || undefined}
      onMouseEnter={keepInView}
      onMouseLeave={() => setDismissed(false)}
    >
      {trigger}
      {/* aria-hidden: a tab list may only contain tabs, and this sits inside one. The tab
          still announces the text, because aria-describedby reads hidden content it points
          to (docs/DECISIONS.md, 0059). */}
      <span
        ref={tooltipRef}
        id={tooltipId}
        role="tooltip"
        aria-hidden
        className="t-tt text-caption font-normal font-body text-text-primary"
      >
        {tooltip}
      </span>
    </span>
  )
}

export function TabsTrigger({
  value,
  children,
  icon: Icon,
  iconClassName,
  className,
  variant = 'segmented',
  tooltip,
}: TabsTriggerProps) {
  if (variant === 'pill') {
    return (
      <PillTrigger
        value={value}
        icon={Icon}
        iconClassName={iconClassName}
        className={className}
        tooltip={tooltip}
      >
        {children}
      </PillTrigger>
    )
  }
  return (
    <UI.TabsTrigger variant={variant} value={value} className={className}>
      {Icon && <Icon aria-hidden className={cn('h-4 w-4 shrink-0', iconClassName)} />}
      {children}
    </UI.TabsTrigger>
  )
}

export interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  return (
    <UI.TabsContent value={value} className={className}>
      {children}
    </UI.TabsContent>
  )
}
