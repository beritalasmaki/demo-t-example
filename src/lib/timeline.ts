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

/**
 * Resolves a list of evidence ids (a `PolicyGate.evidenceIds` or a summary sentence's
 * `evidenceIds` — both point into the timeline the same way) to the actual events. Shared by
 * `lib/gates.ts` and `lib/summary.ts` rather than duplicated, since it's the identical lookup
 * both regions need. An id that doesn't resolve to a real event is silently dropped — a
 * dangling id is a data problem to fix in the fixture, not something to explain to a reviewer.
 */
export function resolveEvidenceIds(ids: string[], timeline: TimelineEvent[]): TimelineEvent[] {
  const byId = new Map(timeline.map((event) => [event.id, event]))
  return ids.map((id) => byId.get(id)).filter((event): event is TimelineEvent => event != null)
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
 * even with every relevant type hidden) and "Filters state what is hidden and how many items
 * that is." Filtering never actually removes an error or a retry — only the count of
 * genuinely-excluded events shrinks.
 *
 * `hiddenTypes`, not `activeTypes`: empty means nothing is hidden (the default), and a type
 * in the set is the one being excluded — the dropdown's "N selected" reads as an exception
 * state, matching TimelineFilters.tsx's own inverted semantics.
 */
export function filterTimeline(
  events: TimelineEvent[],
  hiddenTypes: ReadonlySet<TimelineEvent['type']>,
): FilteredTimeline {
  const visible: TimelineEvent[] = []
  const forcedVisibleIds = new Set<string>()

  for (const event of events) {
    const isHidden = hiddenTypes.has(event.type)
    if (!isHidden) {
      visible.push(event)
    } else if (isError(event) || isRetry(event)) {
      visible.push(event)
      forcedVisibleIds.add(event.id)
    }
  }

  return { visible, forcedVisibleIds, hiddenCount: events.length - visible.length }
}

const NEW_AND_EXISTING = /(\d+)\s+new(?:\s+tests?)?\s+and\s+(\d+)\s+existing\s+tests?\s+passing/i
const PASSED = /(\d+)\s+(?:tests?\s+)?passed/i

/**
 * Tests passing across the run, summed from each test run's `detail` ("162 passed", "14 new and
 * 96 existing tests passing"). There is no count field on `TimelineEvent`, so this reads the
 * sentence the same way `isRetry` reads a title — a heuristic checked against every fixture
 * (timeline.test.ts). Undefined when no test run states a count: the page then says
 * "unknown", never guesses.
 */
export function testsPassing(events: TimelineEvent[]): number | undefined {
  let total: number | undefined
  for (const event of events) {
    if (event.type !== 'test_run' || !event.detail) continue
    const both = NEW_AND_EXISTING.exec(event.detail)
    const passed = both ? undefined : PASSED.exec(event.detail)
    if (both) total = (total ?? 0) + Number(both[1]) + Number(both[2])
    else if (passed) total = (total ?? 0) + Number(passed[1])
  }
  return total
}
