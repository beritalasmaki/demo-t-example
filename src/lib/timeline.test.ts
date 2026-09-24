import { describe, expect, it } from 'vitest'
import type { TimelineEvent } from './types'
import { isError, isRetry, testsPassing, timelineShape } from './timeline'

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

describe('testsPassing', () => {
  it('sums the counts every fixture states', async () => {
    const { runBlocked, runClean, runMessy } = await import('../fixtures')
    expect(testsPassing(runMessy.timeline)).toBe(164)
    expect(testsPassing(runBlocked.timeline)).toBe(110)
    expect(testsPassing(runClean.timeline)).toBe(47)
  })

  it('is undefined when no test run states a count', () => {
    expect(
      testsPassing([{ id: 'x', at: '', type: 'test_run', title: 'Ran tests.' }]),
    ).toBeUndefined()
  })
})
