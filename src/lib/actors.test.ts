import { describe, expect, it } from 'vitest'
import { isSystemActor } from './actors'

describe('isSystemActor', () => {
  it('recognizes every system name actually used across the fixtures', () => {
    expect(isSystemActor('policy-engine v2.3')).toBe(true)
    expect(isSystemActor('license-scanner v1.4')).toBe(true)
    expect(isSystemActor('coverage-gate v3.1')).toBe(true)
    expect(isSystemActor('a11y-scanner v2.0')).toBe(true)
  })

  it('recognizes every person name actually used across the fixtures', () => {
    expect(isSystemActor('Aino Lehtomäki')).toBe(false)
    expect(isSystemActor('Kaisa Heinämäki')).toBe(false)
    expect(isSystemActor('Juhani Virtaleppäsoutu')).toBe(false)
  })

  it('is not fooled by a person name containing the letter v', () => {
    expect(isSystemActor('Victor Vance')).toBe(false)
  })
})
