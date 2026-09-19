import { describe, expect, it } from 'vitest'
import { runClean } from './run-clean'

describe('runClean', () => {
  it('every evidence id used by a gate or a summary sentence points to a real timeline event', () => {
    const timelineIds = new Set(runClean.timeline.map((event) => event.id))
    const referenced = [
      ...runClean.gates.flatMap((gate) => gate.evidenceIds),
      ...runClean.summary.flatMap((sentence) => sentence.evidenceIds),
    ]

    for (const id of referenced) {
      expect(timelineIds.has(id)).toBe(true)
    }
  })

  it('is boring by design: every gate passes and nothing is waived or unknown', () => {
    expect(runClean.gates.every((gate) => gate.result === 'pass')).toBe(true)
  })

  it('has no recorded decision yet — it is awaiting review', () => {
    expect(runClean.status).toBe('awaiting_review')
    expect(runClean.decision).toBeUndefined()
  })

  it('states a file-change count in its summary that matches the actual timeline', () => {
    const fileChangeCount = runClean.timeline.filter((event) => event.type === 'file_change').length
    const [, filesAndTestsSentence] = runClean.summary
    expect(filesAndTestsSentence.text).toContain(String(fileChangeCount))
  })
})
