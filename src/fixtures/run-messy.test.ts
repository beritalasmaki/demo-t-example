import { describe, expect, it } from 'vitest'
import { runMessy } from './run-messy'

describe('runMessy', () => {
  it('every evidence id used by a gate or a summary sentence points to a real timeline event', () => {
    const timelineIds = new Set(runMessy.timeline.map((event) => event.id))
    const referenced = [
      ...runMessy.gates.flatMap((gate) => gate.evidenceIds),
      ...runMessy.summary.flatMap((sentence) => sentence.evidenceIds),
    ]

    for (const id of referenced) {
      expect(timelineIds.has(id)).toBe(true)
    }
  })

  it('models "no confidence value" by omitting the area, not by a placeholder', () => {
    const areas = runMessy.confidence.map((area) => area.area)
    expect(areas).not.toContain('security')
  })

  it('keeps the undo window active by computing decision.at relative to now', () => {
    const decidedAt = new Date(runMessy.decision!.at).getTime()
    const minutesAgo = (Date.now() - decidedAt) / (60 * 1000)
    expect(minutesAgo).toBeGreaterThanOrEqual(0)
    expect(minutesAgo).toBeLessThan(10)
  })

  it('has at least 200 timeline events, all with unique ids, in chronological order', () => {
    expect(runMessy.timeline.length).toBeGreaterThanOrEqual(200)

    const ids = runMessy.timeline.map((event) => event.id)
    expect(new Set(ids).size).toBe(ids.length)

    const timestamps = runMessy.timeline.map((event) => new Date(event.at).getTime())
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1])
    }
  })
})
