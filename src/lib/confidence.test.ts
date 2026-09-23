import { describe, expect, it } from 'vitest'
import { confidenceLevel, resolveConfidenceAreas } from './confidence'
import { runBlocked, runMessy } from '../fixtures'

describe('resolveConfidenceAreas', () => {
  it('returns all four areas, in the fixed order, when every one is reported', () => {
    const resolved = resolveConfidenceAreas(runBlocked.confidence)
    expect(resolved.map((r) => r.area)).toEqual([
      'implementation',
      'tests',
      'security',
      'side_effects',
    ])
    expect(resolved.every((r) => r.missing === false)).toBe(true)
  })

  it('marks an omitted area as missing, without inventing a value for it', () => {
    // run-messy's own fixture comment: no entry for "security" at all.
    const resolved = resolveConfidenceAreas(runMessy.confidence)
    const security = resolved.find((r) => r.area === 'security')
    expect(security).toEqual({ area: 'security', missing: true })

    const implementation = resolved.find((r) => r.area === 'implementation')
    expect(implementation?.missing).toBe(false)
  })

  it('marks every area missing for an empty confidence array', () => {
    const resolved = resolveConfidenceAreas([])
    expect(resolved.every((r) => r.missing === true)).toBe(true)
    expect(resolved).toHaveLength(4)
  })
})

describe('confidenceLevel', () => {
  it('matches the whole percentage shown, at each boundary', () => {
    expect(confidenceLevel(0.88)).toBe('high')
    expect(confidenceLevel(0.85)).toBe('high')
    expect(confidenceLevel(0.846)).toBe('high') // shown as 85%
    expect(confidenceLevel(0.84)).toBe('medium')
    expect(confidenceLevel(0.81)).toBe('medium')
    expect(confidenceLevel(0.6)).toBe('medium')
    expect(confidenceLevel(0.59)).toBe('low')
    expect(confidenceLevel(0.52)).toBe('low')
  })
})
