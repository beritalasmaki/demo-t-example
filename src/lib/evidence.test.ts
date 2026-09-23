import { describe, expect, it } from 'vitest'
import { runBlocked, runMessyPending } from '../fixtures'
import { buildEvidenceGroups } from './evidence'

describe('buildEvidenceGroups', () => {
  it('groups evidence by what it supports, with the matching score', () => {
    const groups = buildEvidenceGroups(runMessyPending)
    expect(groups.map((group) => [group.title, group.supports])).toEqual([
      ['The code change', '6 files changed · 81% implementation'],
      ['Tests', '2 test runs · 88% tests'],
      ['Policy checks', '4 passed · 2 not run · no security score'],
      ['Findings and side effects', '52% side effects'],
    ])
    expect(groups[2].supportsAttention).toBe(true)
  })

  it('labels a person’s review, and highlights checks that did not run', () => {
    const checks = buildEvidenceGroups(runMessyPending).find((group) => group.id === 'checks')!
    const byId = (id: string) => checks.rows.find((row) => row.event.id === id)!
    expect(byId('m15').kind).toBe('Human review')
    expect(byId('m15').actor).toBe('Aino Lehtomäki')
    expect(byId('m16').kind).toBe('Not run')
    expect(byId('m16').attention).toBe(true)
    expect(byId('m13').attention).toBe(false)
  })

  it('leaves plain reading steps out, keeping ones that recorded a finding', () => {
    const findings = buildEvidenceGroups(runMessyPending).find((group) => group.id === 'findings')!
    expect(findings.rows.map((row) => row.event.id)).toEqual(['m4', 'm19', 'm20'])
  })

  it('shows an error in the tests group and a failed check', () => {
    const groups = buildEvidenceGroups(runBlocked)
    expect(groups.find((g) => g.id === 'tests')!.rows[0].kind).toBe('Error')
    expect(groups.find((g) => g.id === 'checks')!.supports).toMatch(/1 failed/)
  })
})
