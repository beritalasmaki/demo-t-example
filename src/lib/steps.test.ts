import { describe, expect, it } from 'vitest'
import { runBlocked, runMessy } from '../fixtures'
import { foldSteps, formatStepNumber, stepActor, stepResult } from './steps'

describe('foldSteps', () => {
  it('folds the 180 repeated shard checks into one group and keeps every event', () => {
    const rows = foldSteps(runMessy.timeline)
    const groups = rows.filter((row) => row.kind === 'group')
    expect(groups).toHaveLength(1)
    expect(groups[0].kind === 'group' && groups[0].events).toHaveLength(180)
    expect(groups[0].kind === 'group' && groups[0].firstNumber).toBe(11)

    const counted = rows.reduce((n, row) => n + (row.kind === 'group' ? row.events.length : 1), 0)
    expect(counted).toBe(runMessy.timeline.length)
  })

  it('never folds an error or a short run', () => {
    expect(foldSteps(runBlocked.timeline).every((row) => row.kind === 'step')).toBe(true)
  })
})

describe('formatStepNumber', () => {
  it('pads to the run length and joins a range', () => {
    expect(formatStepNumber(1, 200)).toBe('001')
    expect(formatStepNumber(11, 200, 190)).toBe('011–190')
    expect(formatStepNumber(3, 13)).toBe('03')
  })
})

describe('stepActor and stepResult', () => {
  const event = (id: string) => runMessy.timeline.find((e) => e.id === id)!

  it('names the gate’s evaluator for a gate evaluation, and the agent otherwise', () => {
    expect(stepActor(event('m15'), runMessy)).toBe('Aino Lehtomäki')
    expect(stepActor(event('m16'), runMessy)).toBe('license-scanner v1.4')
    expect(stepActor(event('m1'), runMessy)).toBe('Kestrel v4.3.0')
  })

  it('uses the gate’s own result label, and flags open notes and errors', () => {
    expect(stepResult(event('m16'), runMessy)).toEqual({ label: 'Not run', tone: 'attention' })
    expect(stepResult(event('m13'), runMessy)).toEqual({ label: 'Passed', tone: 'done' })
    expect(stepResult(event('m19'), runMessy)).toEqual({ label: 'Open', tone: 'attention' })
    const error = runBlocked.timeline.find((e) => e.type === 'error')!
    expect(stepResult(error, runBlocked)).toEqual({ label: 'Error', tone: 'failed' })
  })
})
