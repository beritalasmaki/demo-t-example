import { describe, expect, it } from 'vitest'
import { resolveConfidenceAreas } from './confidence'
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
