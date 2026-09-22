import { History } from 'lucide-react'
import { useState } from 'react'
import { IconText } from '../../components/IconText'
import { RegionCard } from '../../components/RegionCard'
import { formatRelativeTime } from '../../lib/format'
import { filterTimeline, timelineShape } from '../../lib/timeline'
import type { TimelineEvent } from '../../lib/types'
import { TimelineEventRow } from './TimelineEventRow'
import { TimelineFilters } from './TimelineFilters'

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
  /** Which types start hidden. Defaults to none; mainly for stories and tests that need to
   * render an already-filtered state rather than simulate opening the dropdown. */
  defaultHiddenTypes?: ReadonlySet<TimelineEvent['type']>
}

export function Timeline({
  events,
  startedAt,
  isLoading = false,
  defaultHiddenTypes,
}: TimelineProps) {
  const [hiddenTypes, setHiddenTypes] = useState<Set<TimelineEvent['type']>>(
    new Set(defaultHiddenTypes ?? []),
  )

  const heading = (
    <>
      <h2 id="audit-log-heading" className="text-section-heading font-semibold text-text-primary">
        <IconText icon={History}>Audit log</IconText>
      </h2>
      <p className="text-meta font-normal font-body text-text-secondary">
        What the agent did during this run.
      </p>
    </>
  )

  if (isLoading) {
    return (
      <RegionCard className="flex flex-col gap-[var(--space-3)]">
        {heading}
        <p role="status" className="text-body font-normal font-body text-text-secondary">
          Loading the audit log…
        </p>
      </RegionCard>
    )
  }

  if (events.length === 0) {
    return (
      <RegionCard className="flex flex-col gap-[var(--space-3)]">
        {heading}
        <p className="text-body font-normal font-body text-text-secondary">
          No events yet. This run started {formatRelativeTime(startedAt)}.
        </p>
      </RegionCard>
    )
  }

  const shape = timelineShape(events)
  const { visible, forcedVisibleIds, hiddenCount } = filterTimeline(events, hiddenTypes)

  return (
    <RegionCard className="flex flex-col gap-[var(--space-3)]">
      {heading}
      <p className="text-meta font-normal font-body text-text-secondary">
        {shape.total} {pluralize(shape.total, 'step')} · {shape.errors}{' '}
        {pluralize(shape.errors, 'error')} · {shape.retries}{' '}
        {pluralize(shape.retries, 'retry', 'retries')}
      </p>

      {/* The filter control and the count of what it's currently hiding share one row —
       * "Filters state what is hidden and how many items that is" reads as a single fact,
       * not two separate lines. */}
      <div className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[var(--space-2)]">
        <TimelineFilters hiddenTypes={hiddenTypes} onHiddenTypesChange={setHiddenTypes} />
        <p aria-live="polite" className="text-meta font-normal font-body text-text-secondary">
          {hiddenCount} {pluralize(hiddenCount, 'event')} hidden by the filters.
        </p>
      </div>

      <ul className="flex max-h-96 flex-col gap-[var(--space-5)] overflow-y-auto">
        {visible.map((event) => (
          <TimelineEventRow
            key={event.id}
            event={event}
            forcedVisible={forcedVisibleIds.has(event.id)}
          />
        ))}
      </ul>
    </RegionCard>
  )
}
