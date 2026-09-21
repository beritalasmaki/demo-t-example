import { describe, expect, it } from 'vitest'
import type { PolicyGate } from './types'
import {
  formatDateTime,
  formatDuration,
  formatGateResultLabel,
  formatRelativeTime,
  formatSignOffMessage,
} from './format'

function gate(overrides: Partial<PolicyGate> & Pick<PolicyGate, 'result'>): PolicyGate {
  return {
    id: 'gate',
    name: 'A gate',
    plainLanguage: '',
    evaluatedBy: 'policy-engine v2.3',
    evaluatedAt: '2026-01-01T00:00:00Z',
    evidenceIds: [],
    ...overrides,
  }
}

describe('formatGateResultLabel', () => {
  it('uses the exact Content rules label for pass, fail, not_applicable and unknown', () => {
    expect(formatGateResultLabel(gate({ result: 'pass' }))).toBe('Passed')
    expect(formatGateResultLabel(gate({ result: 'fail' }))).toBe('Failed')
    expect(formatGateResultLabel(gate({ result: 'not_applicable' }))).toBe('Not applicable')
    expect(formatGateResultLabel(gate({ result: 'unknown' }))).toBe('Not run')
  })

  it('names the person for a waived gate: "Exception by <name>"', () => {
    const waived = gate({
      result: 'waived',
      waiver: { by: 'Owen Baptiste', reason: 'Cleared already.', at: '2026-01-01T00:00:00Z' },
    })
    expect(formatGateResultLabel(waived)).toBe('Exception by Owen Baptiste')
  })

  it('falls back to the bare label if a waived gate somehow has no waiver recorded', () => {
    expect(formatGateResultLabel(gate({ result: 'waived' }))).toBe('Exception')
  })
})

describe('formatDateTime', () => {
  it('says "today" when the date is the same day as now', () => {
    const now = new Date('2026-03-04T18:00:00Z')
    expect(formatDateTime('2026-03-04T14:11:00Z', now)).toMatch(/today$/)
  })

  it('uses 24-hour clock time, matching the spec’s own "14:32" example — not locale-default AM/PM', () => {
    const now = new Date('2026-03-04T18:00:00Z')
    expect(formatDateTime('2026-03-04T14:11:00Z', now)).toBe('14:11 today')
  })

  it('names the date when it is not today', () => {
    const now = new Date('2026-03-06T10:00:00Z')
    const result = formatDateTime('2026-03-04T14:11:00Z', now)
    expect(result).not.toMatch(/today$/)
    expect(result).toContain('2026')
  })
})

describe('formatRelativeTime', () => {
  it('reports minutes for a difference under an hour', () => {
    const now = new Date('2026-03-04T14:19:00Z')
    expect(formatRelativeTime('2026-03-04T14:11:00Z', now)).toMatch(/8 minutes ago/)
  })

  it('reports days for a difference of several days', () => {
    const now = new Date('2026-03-10T00:00:00Z')
    expect(formatRelativeTime('2026-03-04T00:00:00Z', now)).toMatch(/6 days ago/)
  })
})

describe('formatDuration', () => {
  it('uses the largest sensible unit, matching the spec’s own "4 min 12 s" example', () => {
    expect(formatDuration(4 * 60_000 + 12_000)).toBe('4 min 12 s')
  })

  it('omits minutes entirely under a minute', () => {
    expect(formatDuration(45_000)).toBe('45 s')
  })

  it('never goes negative', () => {
    expect(formatDuration(-5_000)).toBe('0 s')
  })
})

describe('formatSignOffMessage', () => {
  it('matches the Content rules example exactly for one of each', () => {
    expect(formatSignOffMessage(1, 1)).toBe('I have seen 1 failed check and 1 exception.')
  })

  it('pluralizes both halves', () => {
    expect(formatSignOffMessage(2, 3)).toBe('I have seen 2 failed checks and 3 exceptions.')
  })

  it('omits a zero-count half instead of naming it', () => {
    expect(formatSignOffMessage(0, 2)).toBe('I have seen 2 exceptions.')
    expect(formatSignOffMessage(1, 0)).toBe('I have seen 1 failed check.')
  })
})
