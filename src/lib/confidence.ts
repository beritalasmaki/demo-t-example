import type { ConfidenceArea } from './types'

/**
 * Region 5's fixed vocabulary of areas. See `ConfidenceArea['area']` in lib/types.ts: the
 * model reporting no value for an area means it's simply absent from `Run.confidence` — "no
 * value" is modeled by omission, not a placeholder. Presenting a fixed, always-complete list
 * (rather than only what happens to be in the array) is what makes an omitted area visible
 * as "Not checked" instead of silently missing — docs/spec-review-screen.md, Hierarchy and
 * disclosure: "Never hidden: an area with no confidence value at all."
 */
export const ALL_CONFIDENCE_AREAS: ConfidenceArea['area'][] = [
  'implementation',
  'tests',
  'security',
  'side_effects',
]

export type ResolvedConfidenceArea =
  (ConfidenceArea & { missing: false }) | { area: ConfidenceArea['area']; missing: true }

/**
 * Every area in `ALL_CONFIDENCE_AREAS`, in that fixed order, each either the real
 * `ConfidenceArea` the model reported or a `missing: true` placeholder for one it didn't.
 * There is no "reason" field for a missing area anywhere in the data model — Acceptance
 * criteria's "with the reason when known" only ever has one to show, so none is invented.
 */
export function resolveConfidenceAreas(confidence: ConfidenceArea[]): ResolvedConfidenceArea[] {
  const byArea = new Map(confidence.map((area) => [area.area, area]))
  return ALL_CONFIDENCE_AREAS.map((area) => {
    const found = byArea.get(area)
    return found ? { ...found, missing: false } : { area, missing: true }
  })
}

export type ConfidenceLevel = 'high' | 'medium' | 'low'

/**
 * A plain level for a confidence value, so "52%" never has to be read on its own — people
 * don't know whether 52% is high or low (docs/DECISIONS.md, 0041). The cut-offs are this app's
 * own policy, not the model's: 85% and above is High, 60% to 84% is Medium, below 60% is Low.
 * Rounded to a whole percentage first, so the level always agrees with the number shown.
 */
export function confidenceLevel(value: number): ConfidenceLevel {
  const percent = Math.round(value * 100)
  if (percent >= 85) return 'high'
  if (percent >= 60) return 'medium'
  return 'low'
}
