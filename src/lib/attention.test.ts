import { describe, expect, it } from 'vitest'
import { buildAttentionItems } from './attention'
import { runBlocked, runClean, runMessy } from '../fixtures'
import type { Run } from './types'

function run(overrides: Partial<Run> = {}): Run {
  return {
    id: 'test-run',
    initiative: 'Test initiative',
    requestedBy: 'Someone',
    revision: 'abc123',
    target: { system: 'test-service', environment: 'staging' },
    agent: { name: 'Kestrel', version: '1.0.0', model: 'kestrel-code' },
    startedAt: '2026-01-01T00:00:00Z',
    status: 'awaiting_review',
    summary: [],
    gates: [],
    timeline: [],
    confidence: [],
    ...overrides,
  }
}

describe('buildAttentionItems', () => {
  it('returns nothing when there is nothing to flag', () => {
    expect(buildAttentionItems(run())).toEqual([])
  })

  it('flags run-clean with only the one thing it could not verify, nothing alarming', () => {
    const items = buildAttentionItems(runClean)
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      lead: 'Side effects confidence is 88%.',
      body: 'Very large appointment histories were not tested for export performance in the browser.',
      linkHref: '#confidence-heading',
      linkLabel: 'See confidence',
    })
  })

  it('flags run-blocked with the failed gate, the waived gate, and the weakest confidence area', () => {
    const items = buildAttentionItems(runBlocked)
    expect(items).toHaveLength(3)
    expect(items[0]).toMatchObject({
      lead: '1 check failed.',
      body: 'Data retention.',
      linkHref: '#policy-gates-heading',
      linkLabel: 'See policy gates',
    })
    expect(items[1]).toMatchObject({
      lead: '1 exception granted.',
      body: 'Open-source licensing.',
      linkHref: '#policy-gates-heading',
      linkLabel: 'See policy gates',
    })
    expect(items[2]).toMatchObject({
      lead: 'Side effects confidence is 38%.',
      body: 'Whether any internal service already calls this endpoint fast enough to be rate-limited by mistake.',
      linkHref: '#confidence-heading',
      linkLabel: 'See confidence',
    })
  })

  it('flags run-messy with the two not-run gates, the weakest confidence area, and the flagged audit note', () => {
    const items = buildAttentionItems(runMessy)
    expect(items).toHaveLength(3)
    expect(items[0]).toMatchObject({
      lead: '2 checks did not run.',
      body: 'Open-source licensing, Accessibility.',
      linkHref: '#policy-gates-heading',
      linkLabel: 'See policy gates',
    })
    expect(items[1].linkHref).toBe('#confidence-heading')
    expect(items[2]).toMatchObject({
      id: 'attention-note-m19',
      lead: 'The nightly reconciliation job was not re-run against this change.',
      body: 'It next runs at 02:00.',
      linkHref: '#timeline-event-m19',
      linkLabel: 'See audit log',
    })
  })

  it('never flags a confidence area with nothing unverified, however low its value', () => {
    const items = buildAttentionItems(
      run({
        confidence: [
          {
            area: 'security',
            value: 0.1,
            basis: 'Based on nothing in particular.',
            rationale: 'No reasoning given.',
            unverified: [],
          },
        ],
      }),
    )
    expect(items).toEqual([])
  })

  it('ignores error-severity timeline events — those are already visible in the audit log', () => {
    const items = buildAttentionItems(
      run({
        timeline: [
          {
            id: 't1',
            at: '2026-01-01T00:00:00Z',
            type: 'error',
            title: 'Test run failed to start.',
            severity: 'error',
          },
        ],
      }),
    )
    expect(items).toEqual([])
  })
})
