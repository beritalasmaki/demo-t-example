import { describe, expect, it } from 'vitest'
import type { PolicyGate, TimelineEvent } from './types'
import { explanationFor, resolveEvidence } from './gates'

function gate(overrides: Partial<PolicyGate> & Pick<PolicyGate, 'id' | 'result'>): PolicyGate {
  return {
    name: overrides.id,
    plainLanguage: '',
    evaluatedBy: 'policy-engine v2.3',
    evaluatedAt: '2026-01-01T00:00:00Z',
    evidenceIds: [],
    ...overrides,
  }
}

describe('resolveEvidence', () => {
  const timeline: TimelineEvent[] = [
    { id: 't1', at: '2026-01-01T00:00:00Z', type: 'file_change', title: 'Changed a file' },
    {
      id: 't2',
      at: '2026-01-01T00:01:00Z',
      type: 'gate_eval',
      title: 'Evaluated',
      detail: 'Why it failed.',
    },
  ]

  it('resolves evidence ids to their timeline events, in order', () => {
    const g = gate({ id: 'a', result: 'fail', evidenceIds: ['t2', 't1'] })
    expect(resolveEvidence(g, timeline).map((e) => e.id)).toEqual(['t2', 't1'])
  })

  it('drops ids that do not resolve to a real event, rather than erroring', () => {
    const g = gate({ id: 'a', result: 'fail', evidenceIds: ['t1', 'does-not-exist'] })
    expect(resolveEvidence(g, timeline).map((e) => e.id)).toEqual(['t1'])
  })

  it('returns an empty array when there is no evidence', () => {
    const g = gate({ id: 'a', result: 'pass', evidenceIds: [] })
    expect(resolveEvidence(g, timeline)).toEqual([])
  })
})

describe('explanationFor', () => {
  const timeline: TimelineEvent[] = [
    { id: 't1', at: '2026-01-01T00:00:00Z', type: 'file_change', title: 'No detail here' },
    {
      id: 't2',
      at: '2026-01-01T00:01:00Z',
      type: 'gate_eval',
      title: 'Evaluated',
      detail: 'Why it failed.',
    },
  ]

  it('returns the first resolved event detail', () => {
    const g = gate({ id: 'a', result: 'fail', evidenceIds: ['t1', 't2'] })
    expect(explanationFor(g, timeline)).toBe('Why it failed.')
  })

  it('is undefined for a passing gate, even with evidence that has a detail', () => {
    const g = gate({ id: 'a', result: 'pass', evidenceIds: ['t2'] })
    expect(explanationFor(g, timeline)).toBeUndefined()
  })

  it('is undefined when no resolved evidence has a detail', () => {
    const g = gate({ id: 'a', result: 'fail', evidenceIds: ['t1'] })
    expect(explanationFor(g, timeline)).toBeUndefined()
  })
})

describe('explanationFor, with a file change listed before the evaluation', () => {
  it('prefers the gate evaluation’s own detail', async () => {
    const { runMessy } = await import('../fixtures')
    const licensing = runMessy.gates.find((g) => g.id === 'licensing')!
    expect(explanationFor(licensing, runMessy.timeline)).toMatch(/timed out after 10 minutes/)
  })
})
