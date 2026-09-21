import { describe, expect, it } from 'vitest'
import type { PolicyGate, TimelineEvent } from './types'
import { explanationFor, gateAcknowledgement, resolveEvidence, sortGates } from './gates'

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

describe('sortGates', () => {
  it('sorts failed and waived first, then unknown, then not_applicable, then pass', () => {
    const gates = [
      gate({ id: 'a', result: 'pass' }),
      gate({ id: 'b', result: 'not_applicable' }),
      gate({ id: 'c', result: 'unknown' }),
      gate({ id: 'd', result: 'waived' }),
      gate({ id: 'e', result: 'fail' }),
    ]

    expect(sortGates(gates).map((g) => g.result)).toEqual([
      'waived',
      'fail',
      'unknown',
      'not_applicable',
      'pass',
    ])
  })

  it('keeps the original order for gates in the same tier (stable sort)', () => {
    const gates = [
      gate({ id: 'fail-1', result: 'fail' }),
      gate({ id: 'waived-1', result: 'waived' }),
      gate({ id: 'fail-2', result: 'fail' }),
    ]

    expect(sortGates(gates).map((g) => g.id)).toEqual(['fail-1', 'waived-1', 'fail-2'])
  })

  it('does not mutate the input array', () => {
    const gates = [gate({ id: 'a', result: 'pass' }), gate({ id: 'b', result: 'fail' })]
    const original = [...gates]
    sortGates(gates)
    expect(gates).toEqual(original)
  })
})

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

describe('gateAcknowledgement', () => {
  it('counts nothing and requires nothing when every gate passed', () => {
    const gates = [gate({ id: 'a', result: 'pass' }), gate({ id: 'b', result: 'not_applicable' })]
    expect(gateAcknowledgement(gates)).toEqual({
      failedCount: 0,
      waivedCount: 0,
      requiredGateIds: [],
    })
  })

  it('counts failed and waived separately, and does not count unknown or not_applicable', () => {
    const gates = [
      gate({ id: 'fail-1', result: 'fail' }),
      gate({ id: 'waived-1', result: 'waived' }),
      gate({ id: 'unknown-1', result: 'unknown' }),
      gate({ id: 'na-1', result: 'not_applicable' }),
    ]
    expect(gateAcknowledgement(gates)).toEqual({
      failedCount: 1,
      waivedCount: 1,
      requiredGateIds: ['fail-1', 'waived-1'],
    })
  })
})
