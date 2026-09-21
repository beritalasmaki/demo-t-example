import type { ElementType, ReactNode } from 'react'
import { cn } from '../lib/utils'

/**
 * The visible container every top-level region of a screen sits in — background and border,
 * one consistent radius and padding, from tokens only. Before this existed, regions on
 * `RunReviewPage` were separated by spacing alone, with no boundary of their own (only
 * individual rows inside a region — a gate, a timeline event — had one, via `Disclosure`'s
 * own default styling). Knows nothing about runs, gates or any other product concept, so it
 * belongs here rather than in `features/run/`.
 *
 * `as` picks the rendered element — a region's own root is sometimes semantically a
 * `<header>` (`RunHeader`) and otherwise a plain `<div>`; this carries the same visible
 * container either way without forcing a specific tag.
 */
export interface RegionCardProps {
  as?: ElementType
  children: ReactNode
  className?: string
}

export function RegionCard({ as: Tag = 'div', children, className }: RegionCardProps) {
  return (
    <Tag
      className={cn(
        'rounded-md border border-border-subtle bg-surface p-[var(--space-4)]',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
