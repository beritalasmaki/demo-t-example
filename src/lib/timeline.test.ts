import { describe, expect, it } from 'vitest'
import type { TimelineEvent } from './types'
import { filterTimeline, isError, isRetry, timelineShape } from './timeline'

function event(
  overrides: Partial<TimelineEvent> & Pick<TimelineEvent, 'id' | 'type'>,
): TimelineEvent {
  return {
    at: '2026-01-01T00:00:00Z',
    title: 'An event',
    ...overrides,
  }
}

describe('isRetry', () => {
  it('matches a title that says it is a retry', () => {
    expect(isRetry(event({ id: 'a', type: 'test_run', title: 'Retried the test suite.' }))).toBe(
      true,
    )
  })

  it('does not match an ordinary title', () => {
    expect(isRetry(event({ id: 'a', type: 'test_run', title: 'Ran the test suite.' }))).toBe(false)
  })
})

describe('isError', () => {
  it('matches an error-type event', () => {
    expect(isError(event({ id: 'a', type: 'error', title: 'Something broke.' }))).toBe(true)
  })

  it('matches any type flagged severity: error', () => {
    expect(
      isError(event({ id: 'a', type: 'gate_eval', title: 'Failed.', severity: 'error' })),
    ).toBe(true)
  })

  it('does not match a warning', () => {
    expect(
      isError(event({ id: 'a', type: 'gate_eval', title: 'Did not run.', severity: 'warning' })),
    ).toBe(false)
  })
})

describe('timelineShape', () => {
  it('counts total, errors and retries', () => {
    const events: TimelineEvent[] = [
      event({ id: 'a', type: 'plan' }),
      event({ id: 'b', type: 'error', title: 'Test run failed to start.' }),
      event({ id: 'c', type: 'test_run', title: 'Retried the test suite.' }),
      event({ id: 'd', type: 'gate_eval', severity: 'error', title: 'Data retention failed.' }),
    ]

    expect(timelineShape(events)).toEqual({ total: 4, errors: 2, retries: 1 })
  })
})

describe('filterTimeline', () => {
  const events: TimelineEvent[] = [
    event({ id: 'a', type: 'plan' }),
    event({ id: 'b', type: 'tool_call' }),
    event({ id: 'c', type: 'error', title: 'Test run failed to start.' }),
    event({ id: 'd', type: 'test_run', title: 'Retried the test suite.' }),
    event({ id: 'e', type: 'test_run', title: 'Ran the full suite.' }),
  ]

  it('hides every selected type, except an error or retry among them', () => {
    const result = filterTimeline(events, new Set(['tool_call', 'error', 'test_run']))
    expect(result.visible.map((e) => e.id)).toEqual(['a', 'c', 'd'])
    expect(result.forcedVisibleIds).toEqual(new Set(['c', 'd']))
    expect(result.hiddenCount).toBe(2)
  })

  it('never hides an error or a retry, even with its type selected', () => {
    const result = filterTimeline(events, new Set(['plan', 'tool_call', 'error', 'test_run']))
    expect(result.visible.map((e) => e.id)).toEqual(['c', 'd'])
    expect(result.forcedVisibleIds).toEqual(new Set(['c', 'd']))
    expect(result.hiddenCount).toBe(3)
  })

  it('reports zero hidden when nothing is selected', () => {
    const result = filterTimeline(events, new Set())
    expect(result.hiddenCount).toBe(0)
    expect(result.forcedVisibleIds.size).toBe(0)
  })

  it('keeps original order, not filter-tier order', () => {
    const result = filterTimeline(events, new Set())
    expect(result.visible.map((e) => e.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })
})
