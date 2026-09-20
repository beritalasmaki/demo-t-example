import type { TimelineEvent } from './types'

/**
 * Small domain helpers for the audit log — not UI. See src/lib/README.md.
 *
 * docs/spec-review-screen.md, Region 4: "errors, retries" are always visible, but there is no
 * dedicated `type` for a retry — it's a later event (usually `test_run` or `tool_call`) whose
 * `title` says it is one, following the `error` it retried after (see run-blocked.ts for the
 * worked example this heuristic is built from).
 */
export function isRetry(event: TimelineEvent): boolean {
  return /retr/i.test(event.title)
}

/** An `error`-type event, or any event flagged `severity: 'error'` regardless of its type —
 * a failed gate_eval is just as much "where it errored" as a dedicated error event is. */
export function isError(event: TimelineEvent): boolean {
  return event.type === 'error' || event.severity === 'error'
}

export interface TimelineShape {
  total: number
  errors: number
  retries: number
}

/** Region 4, Hierarchy: "First: the shape of the run — how many steps, where it errored,
 * where it retried" — not just a flat list. */
export function timelineShape(events: TimelineEvent[]): TimelineShape {
  return {
    total: events.length,
    errors: events.filter(isError).length,
    retries: events.filter(isRetry).length,
  }
}

export interface FilteredTimeline {
  /** In original order, including any error/retry events forced back in. */
  visible: TimelineEvent[]
  /** Ids of visible events that would have been excluded by the active types alone — shown
   * only because they're an error or a retry. */
  forcedVisibleIds: Set<string>
  /** Events actually not shown. Never counts a forced-visible event, since it isn't hidden. */
  hiddenCount: number
}

/**
 * Acceptance criteria, Timeline: "Errors and retries are visible with all filters on" (i.e.
 * even with every relevant type filter off) and "Filters state what is hidden and how many
 * items that is." Filtering never actually removes an error or a retry — only the count of
 * genuinely-excluded events shrinks.
 */
export function filterTimeline(
  events: TimelineEvent[],
  activeTypes: ReadonlySet<TimelineEvent['type']>,
): FilteredTimeline {
  const visible: TimelineEvent[] = []
  const forcedVisibleIds = new Set<string>()

  for (const event of events) {
    const matchesFilter = activeTypes.has(event.type)
    if (matchesFilter) {
      visible.push(event)
    } else if (isError(event) || isRetry(event)) {
      visible.push(event)
      forcedVisibleIds.add(event.id)
    }
  }

  return { visible, forcedVisibleIds, hiddenCount: events.length - visible.length }
}
