import { Tabs as TabsPrimitive } from 'radix-ui'
import type { ReactNode } from 'react'
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
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange} className={className}>
      {children}
    </TabsPrimitive.Root>
  )
}

export interface TabsListProps {
  children: ReactNode
  className?: string
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        'flex items-center gap-[var(--space-5)] border-b border-border-subtle',
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
  className?: string
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        '-mb-px border-b-2 border-transparent px-[var(--space-1)] py-[var(--space-2)] text-item-title font-semibold font-body text-text-secondary transition-colors',
        'duration-[var(--motion-duration-fast)] hover:text-text-primary',
        'data-[state=active]:border-primary data-[state=active]:text-text-primary',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        className,
      )}
    >
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
