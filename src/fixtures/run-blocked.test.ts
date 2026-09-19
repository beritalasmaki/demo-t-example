import { describe, expect, it } from 'vitest'
import { runBlocked } from './run-blocked'

describe('runBlocked', () => {
  it('every evidence id used by a gate or a summary sentence points to a real timeline event', () => {
    const timelineIds = new Set(runBlocked.timeline.map((event) => event.id))
    const referenced = [
      ...runBlocked.gates.flatMap((gate) => gate.evidenceIds),
      ...runBlocked.summary.flatMap((sentence) => sentence.evidenceIds),
    ]

    for (const id of referenced) {
      expect(timelineIds.has(id)).toBe(true)
    }
  })

  it('names who granted the waiver and why, not just that one exists', () => {
    const waived = runBlocked.gates.find((gate) => gate.result === 'waived')
    expect(waived?.waiver?.by).toBeTruthy()
    expect(waived?.waiver?.reason.length).toBeGreaterThan(0)
  })

  it('has one error immediately followed by its retry, per docs/spec-review-screen.md', () => {
    const errorIndex = runBlocked.timeline.findIndex((event) => event.type === 'error')
    expect(errorIndex).toBeGreaterThanOrEqual(0)
    expect(runBlocked.timeline.filter((event) => event.type === 'error')).toHaveLength(1)

    const nextEvent = runBlocked.timeline[errorIndex + 1]
    expect(nextEvent?.title.toLowerCase()).toContain('retried')
  })

  it('has no recorded decision yet — it is awaiting review, not already decided', () => {
    expect(runBlocked.status).toBe('awaiting_review')
    expect(runBlocked.decision).toBeUndefined()
  })
})
