import { useState } from 'react'
import { formatRelativeTime } from '../../lib/format'
import { filterTimeline, timelineShape } from '../../lib/timeline'
import type { TimelineEvent } from '../../lib/types'
import { TimelineEventRow } from './TimelineEventRow'
import { TimelineFilters } from './TimelineFilters'

const ALL_TYPES: TimelineEvent['type'][] = [
  'plan',
  'tool_call',
  'file_change',
  'test_run',
  'gate_eval',
  'error',
  'note',
]

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural
}

/**
 * Region 4: the audit log. See docs/spec-review-screen.md, "Hierarchy and disclosure" — this
 * component owns exactly that hierarchy: the shape of the run first (never a flat list),
 * then the filters and what they're currently hiding, then the events themselves.
 *
 * The events list scrolls in its own bounded region (`max-h-96`, Tailwind's own default
 * scale) so this component's own header — the shape summary and the filters — never scrolls
 * away, even at 200+ events. `RunReviewPage` (not built yet) will decide how this whole
 * region sits relative to the run header above it; this is the part within this component's
 * own scope.
 */
export interface TimelineProps {
  events: TimelineEvent[]
  /** The run's own start time — used only for the empty-state message. */
  startedAt: string
  isLoading?: boolean
  /** Which types start active. Defaults to all of them; mainly for stories and tests that
   * need to render an already-filtered state rather than simulate clicking every chip. */
  defaultActiveTypes?: ReadonlySet<TimelineEvent['type']>
}

export function Timeline({
  events,
  startedAt,
  isLoading = false,
  defaultActiveTypes,
}: TimelineProps) {
  const [activeTypes, setActiveTypes] = useState<Set<TimelineEvent['type']>>(
    new Set(defaultActiveTypes ?? ALL_TYPES),
  )

  if (isLoading) {
    return (
      <p role="status" className="text-text-secondary">
        Loading the audit log…
      </p>
    )
  }

  if (events.length === 0) {
    return (
      <p className="text-text-secondary">
        No events yet. This run started {formatRelativeTime(startedAt)}.
      </p>
    )
  }

  const shape = timelineShape(events)
  const { visible, forcedVisibleIds, hiddenCount } = filterTimeline(events, activeTypes)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-secondary">
        {shape.total} {pluralize(shape.total, 'step')} · {shape.errors}{' '}
        {pluralize(shape.errors, 'error')} · {shape.retries}{' '}
        {pluralize(shape.retries, 'retry', 'retries')}
      </p>

      <TimelineFilters activeTypes={activeTypes} onActiveTypesChange={setActiveTypes} />

      {/* Acceptance criteria: "Filters state what is hidden and how many items that is." */}
      <p aria-live="polite" className="text-sm text-text-secondary">
        {hiddenCount} {pluralize(hiddenCount, 'event')} hidden by the active filters.
      </p>

      <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto">
        {visible.map((event) => (
          <TimelineEventRow
            key={event.id}
            event={event}
            forcedVisible={forcedVisibleIds.has(event.id)}
          />
        ))}
      </ul>
    </div>
  )
}
