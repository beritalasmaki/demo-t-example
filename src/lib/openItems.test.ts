import { describe, expect, it } from 'vitest'
import { runBlocked, runClean, runMessyPending } from '../fixtures'
import {
  approvalNeedsReason,
  buildOpenItems,
  buildUnverifiedItems,
  missingChecks,
} from './openItems'

describe('buildOpenItems', () => {
  it('lists not-run gates as one item, then a low score, then a warning note', () => {
    expect(buildOpenItems(runMessyPending)).toEqual([
      {
        id: 'open-gates-unknown',
        kind: 'gates-unknown',
        text: 'Open-source licensing and accessibility checks did not run.',
        target: { kind: 'check', gateId: 'licensing', count: 2 },
      },
      {
        id: 'open-confidence-side_effects',
        kind: 'confidence',
        text: 'Side effects score is low (52%): whether two refunds for the same order might clash under load.',
        target: { kind: 'score', area: 'side_effects' },
      },
      {
        id: 'open-note-m19',
        kind: 'note',
        text: 'The nightly reconciliation job was not re-run against this change.',
        target: { kind: 'step', eventId: 'm19' },
      },
    ])
  })

  it('keeps a failed check and an exception as open items', () => {
    const kinds = buildOpenItems(runBlocked).map((item) => item.kind)
    expect(kinds).toEqual(['gates-fail', 'gates-waived', 'confidence'])
    expect(buildOpenItems(runBlocked)[0].text).toBe('Data retention check failed.')
    expect(buildOpenItems(runBlocked)[1].text).toBe(
      'Open-source licensing: Exception by Kaisa Heinämäki.',
    )
  })

  it('is empty for a clean run', () => {
    expect(buildOpenItems(runClean)).toEqual([])
  })
})

describe('approvalNeedsReason', () => {
  it('requires a reason when a check failed or did not run, and not otherwise', () => {
    expect(approvalNeedsReason(runMessyPending)).toBe(true)
    expect(approvalNeedsReason(runBlocked)).toBe(true)
    expect(approvalNeedsReason(runClean)).toBe(false)
    expect(missingChecks(runMessyPending).map((gate) => gate.id)).toEqual([
      'licensing',
      'accessibility',
    ])
  })
})

describe('buildUnverifiedItems', () => {
  it('puts open items first and minor ones after, leaving High scores out', () => {
    const items = buildUnverifiedItems(runMessyPending)
    expect(items.map((item) => [item.severity, item.text])).toEqual([
      ['open', 'Open-source licensing — not run'],
      ['open', 'Accessibility — not run'],
      ['open', 'Whether two refunds for the same order might clash under load.'],
      [
        'open',
        'The effect on the 02:00 reconciliation job, which has not run against this change yet.',
      ],
      ['minor', 'Whether a scheduled job still uses the old client’s types.'],
      ['minor', 'Security — the agent gave no score'],
    ])
  })

  it('names an exception as minor', () => {
    const texts = buildUnverifiedItems(runBlocked).map((item) => item.text)
    expect(texts).toContain('Open-source licensing — exception by Kaisa Heinämäki')
    expect(texts[0]).toBe('Data retention — failed')
  })
})
