import { describe, expect, it } from 'vitest'
import type { Run, TimelineEvent } from './types'
import { resolveSummarySentences } from './summary'

const events: TimelineEvent[] = [
  { id: 'a', at: '2026-01-01T00:00:00Z', type: 'file_change', title: 'Edited a file.' },
  { id: 'b', at: '2026-01-01T00:01:00Z', type: 'test_run', title: 'Ran the tests.' },
]

function summary(entries: Run['summary']): Run['summary'] {
  return entries
}

describe('resolveSummarySentences', () => {
  it('resolves each sentence to its evidence events, in order', () => {
    const resolved = resolveSummarySentences(
      summary([{ text: 'Two files changed.', evidenceIds: ['a', 'b'] }]),
      events,
    )
    expect(resolved).toEqual([{ text: 'Two files changed.', events: [events[0], events[1]] }])
  })

  it('drops a sentence whose evidence ids do not resolve to any real event', () => {
    const resolved = resolveSummarySentences(
      summary([{ text: 'Unsupported claim.', evidenceIds: ['does-not-exist'] }]),
      events,
    )
    expect(resolved).toEqual([])
  })

  it('drops a sentence with no evidence ids at all', () => {
    const resolved = resolveSummarySentences(
      summary([{ text: 'No source.', evidenceIds: [] }]),
      events,
    )
    expect(resolved).toEqual([])
  })

  it('never returns more than five sentences, counted after dropping unsupported ones', () => {
    const many = Array.from({ length: 7 }, (_, i) => ({
      text: `Sentence ${i}.`,
      evidenceIds: i % 2 === 0 ? ['a'] : ['does-not-exist'],
    }))
    // 4 of the 7 have real evidence (indices 0, 2, 4, 6) — fewer than 5, so none should be
    // trimmed by the cap; this proves the cap counts survivors, not the raw input length.
    const resolved = resolveSummarySentences(summary(many), events)
    expect(resolved).toHaveLength(4)
  })

  it('caps at five sentences when more than five have real evidence', () => {
    const many = Array.from({ length: 8 }, (_, i) => ({
      text: `Sentence ${i}.`,
      evidenceIds: ['a'],
    }))
    const resolved = resolveSummarySentences(summary(many), events)
    expect(resolved).toHaveLength(5)
    expect(resolved.map((s) => s.text)).toEqual([
      'Sentence 0.',
      'Sentence 1.',
      'Sentence 2.',
      'Sentence 3.',
      'Sentence 4.',
    ])
  })
})
