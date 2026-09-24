import { describe, expect, it } from 'vitest'
import { runBlocked, runClean, runMessy, runMessyPending } from '../fixtures'
import { describeDecision, describePendingRun, resolveStory } from './story'
import type { Run } from './types'

describe('resolveStory', () => {
  it('computes each step’s time span from its evidence', () => {
    const files = resolveStory(runMessyPending).find((step) => step.id === 'files')!
    expect(files.startAt).toBe('2026-09-23T07:24:00.000Z')
    expect(files.endAt).toBe('2026-09-23T07:58:00.000Z')
  })

  it('lists changed files as added or edited, by name', () => {
    const files = resolveStory(runMessyPending).find((step) => step.id === 'files')!.files
    expect(files[0]).toEqual({
      path: 'src/services/payments/gateway-client.ts',
      name: 'gateway-client.ts',
      added: true,
    })
    expect(files[1].added).toBe(false)
    expect(files).toHaveLength(6)
  })

  it('marks steps with something to accept as attention, and keeps a missing score visible', () => {
    const steps = resolveStory(runMessyPending)
    const tone = (id: string) => steps.find((step) => step.id === id)!.tone
    expect(tone('plan')).toBe('key')
    expect(tone('reading')).toBe('plain')
    expect(tone('checks')).toBe('attention')
    expect(tone('open')).toBe('attention')
    const checks = steps.find((step) => step.id === 'checks')!
    expect(checks.confidence).toEqual([{ area: 'security', missing: true }])
  })

  it('drops a step whose evidence does not resolve', () => {
    const run: Run = {
      ...runClean,
      story: [...runClean.story, { id: 'ghost', label: 'Ghost', text: 'x', evidenceIds: ['nope'] }],
    }
    expect(resolveStory(run).map((step) => step.id)).not.toContain('ghost')
  })

  it('resolves every step in every fixture', () => {
    for (const run of [runClean, runBlocked, runMessy]) {
      expect(resolveStory(run)).toHaveLength(run.story.length)
    }
  })
})

describe('describePendingRun', () => {
  it('does not ask for a decision while the checks are still running', () => {
    const text = describePendingRun({ ...runMessyPending, status: 'checks_running' })
    expect(text).toMatch(/The checks are still running\.$/)
    expect(text).not.toMatch(/decide|without a result/)
  })

  it('says nothing is released, how long it took, and what is missing', () => {
    expect(describePendingRun(runMessyPending)).toBe(
      'Nothing has been released. The agent worked for 1 h 49 min, changed 6 files, and left 2 checks without a result. Read the run below, then decide.',
    )
    expect(describePendingRun(runBlocked)).toMatch(/changed 2 files, and 1 check failed\./)
    expect(describePendingRun(runClean)).toMatch(/changed 3 files, and all 6 checks passed\./)
  })
})

describe('describeDecision', () => {
  it('names the revision, target, time and what was still missing', () => {
    const text = describeDecision(
      runMessy,
      new Date(new Date(runMessy.decision!.at).getTime() + 3 * 60_000),
    )
    expect(text).toMatch(
      /^approved revision e91a4c for payments-service in production on \d{4}-\d{2}-\d{2} at \d{2}:\d{2} \(UTC.*\), 3 minutes ago, with 2 checks still not run\.$/,
    )
  })

  it('is undefined before a decision', () => {
    expect(describeDecision(runMessyPending)).toBeUndefined()
  })
})
