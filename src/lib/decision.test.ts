import { describe, expect, it } from 'vitest'
import type { Decision } from './types'
import { UNDO_WINDOW_MINUTES, undoWindow } from './decision'

function decision(overrides: Partial<Decision> = {}): Decision {
  return {
    outcome: 'approved',
    by: 'Jordan Ellis',
    at: '2026-01-01T00:00:00Z',
    acknowledgedGateIds: [],
    revision: 'abc123',
    ...overrides,
  }
}

describe('undoWindow', () => {
  it('is active with the full window remaining right after the decision', () => {
    const at = '2026-01-01T00:00:00Z'
    const now = new Date(at)
    const result = undoWindow(decision({ at }), now)
    expect(result.active).toBe(true)
    expect(result.remainingMs).toBe(UNDO_WINDOW_MINUTES * 60_000)
  })

  it('counts down as time passes', () => {
    const at = '2026-01-01T00:00:00Z'
    const now = new Date('2026-01-01T00:03:00Z')
    const result = undoWindow(decision({ at }), now)
    expect(result.active).toBe(true)
    expect(result.remainingMs).toBe(7 * 60_000)
  })

  it('is inactive with zero remaining once the window has closed', () => {
    const at = '2026-01-01T00:00:00Z'
    const now = new Date('2026-01-01T00:10:00Z')
    const result = undoWindow(decision({ at }), now)
    expect(result.active).toBe(false)
    expect(result.remainingMs).toBe(0)
  })

  it('never reports negative remaining time long after the window closed', () => {
    const at = '2026-01-01T00:00:00Z'
    const now = new Date('2026-01-02T00:00:00Z')
    const result = undoWindow(decision({ at }), now)
    expect(result.active).toBe(false)
    expect(result.remainingMs).toBe(0)
  })
})
