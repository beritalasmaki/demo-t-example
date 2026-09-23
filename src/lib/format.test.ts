import { describe, expect, it } from 'vitest'
import type { PolicyGate } from './types'
import {
  formatCalendarDate,
  formatClock,
  formatClockRange,
  formatConfidenceAction,
  formatConfidenceAreaLabel,
  formatConfidenceLevelLabel,
  formatCount,
  formatElapsed,
  formatUtcOffset,
  formatConfidencePercent,
  formatDateTime,
  formatDecisionOutcomeLabel,
  formatDuration,
  formatGateResultLabel,
  formatRelativeTime,
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
      waiver: { by: 'Kaisa Heinämäki', reason: 'Cleared already.', at: '2026-01-01T00:00:00Z' },
    })
    expect(formatGateResultLabel(waived)).toBe('Exception by Kaisa Heinämäki')
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

describe('formatConfidencePercent', () => {
  it('matches the Content rules example exactly', () => {
    expect(formatConfidencePercent(0.72)).toBe('72%')
  })

  it('never shows a decimal', () => {
    expect(formatConfidencePercent(0.385)).toBe('39%')
    expect(formatConfidencePercent(0.9)).toBe('90%')
  })
})

describe('formatConfidenceAreaLabel', () => {
  it('labels every area from the fixed vocabulary', () => {
    expect(formatConfidenceAreaLabel('implementation')).toBe('Implementation')
    expect(formatConfidenceAreaLabel('tests')).toBe('Tests')
    expect(formatConfidenceAreaLabel('security')).toBe('Security')
    expect(formatConfidenceAreaLabel('side_effects')).toBe('Side effects')
  })
})

describe('formatDecisionOutcomeLabel', () => {
  it('labels every outcome from the fixed vocabulary', () => {
    expect(formatDecisionOutcomeLabel('approved')).toBe('Approved')
    expect(formatDecisionOutcomeLabel('changes_requested')).toBe('Changes requested')
    expect(formatDecisionOutcomeLabel('rejected')).toBe('Rejected')
  })
})

describe('formatClock and formatClockRange', () => {
  // Built from local-time parts, so these hold in any time zone the tests run in.
  const at = (h: number, m: number) => new Date(2026, 8, 23, h, m).toISOString()

  it('is a 24-hour local clock time', () => {
    expect(formatClock(at(9, 5))).toBe('09:05')
    expect(formatClock(at(14, 32))).toBe('14:32')
  })

  it('joins a range with an en dash, or shows one time when both ends match', () => {
    expect(formatClockRange(at(10, 24), at(10, 50))).toBe('10:24–10:50')
    expect(formatClockRange(at(10, 2), at(10, 2))).toBe('10:02')
  })

  it('writes the calendar date as YYYY-MM-DD', () => {
    expect(formatCalendarDate(at(10, 2))).toBe('2026-09-23')
  })
})

describe('formatUtcOffset', () => {
  const withOffset = (minutesAheadOfUtc: number) =>
    ({ getTimezoneOffset: () => -minutesAheadOfUtc }) as Date

  it('writes whole and half-hour offsets on both sides of UTC', () => {
    expect(formatUtcOffset(withOffset(180))).toBe('UTC+3')
    expect(formatUtcOffset(withOffset(330))).toBe('UTC+5:30')
    expect(formatUtcOffset(withOffset(-240))).toBe('UTC-4')
    expect(formatUtcOffset(withOffset(0))).toBe('UTC')
  })
})

describe('formatElapsed', () => {
  it('uses hours and minutes, dropping a zero part', () => {
    expect(formatElapsed(109 * 60_000)).toBe('1 h 49 min')
    expect(formatElapsed(6 * 60_000)).toBe('6 min')
    expect(formatElapsed(120 * 60_000)).toBe('2 h')
  })
})

describe('formatCount', () => {
  it('includes the unit, singular or plural', () => {
    expect(formatCount(1, 'check')).toBe('1 check')
    expect(formatCount(2, 'check')).toBe('2 checks')
    expect(formatCount(3, 'entry', 'entries')).toBe('3 entries')
  })
})

describe('confidence level wording', () => {
  it('pairs each level with a label and an action', () => {
    expect(formatConfidenceLevelLabel('low')).toBe('Low')
    expect(formatConfidenceAction('low')).toBe('Check this yourself before approving')
    expect(formatConfidenceAction('high')).toBe('No action needed')
  })
})
