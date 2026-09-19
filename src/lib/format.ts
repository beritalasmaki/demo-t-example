import type { GateResult, PolicyGate } from './types'

/**
 * How values are turned into text. See src/lib/README.md and
 * docs/spec-review-screen.md, "Content rules". Rules like these live here, not in a
 * component, so a screen never has to decide the wording for itself.
 */

/** Content rules, "Status names" — the fixed label for each raw GateResult value. Does not
 * include the waiver's name (see `formatGateResultLabel`, which does) or the "Not run"
 * reason (see `explanationFor` in `lib/gates.ts`, which supplies it separately). */
const GATE_RESULT_LABEL: Record<GateResult, string> = {
  pass: 'Passed',
  fail: 'Failed',
  waived: 'Exception',
  not_applicable: 'Not applicable',
  unknown: 'Not run',
}

/**
 * The full label for a gate's result, as a reviewer reads it — "Exception by Owen Baptiste"
 * for a waiver, the fixed label from Content rules for everything else.
 */
export function formatGateResultLabel(gate: PolicyGate): string {
  if (gate.result === 'waived' && gate.waiver) {
    return `Exception by ${gate.waiver.by}`
  }
  return GATE_RESULT_LABEL[gate.result]
}

/**
 * Content rules, "Time": "Clock time first, relative time in brackets: '14:32 today (8
 * minutes ago)'." `now` is a parameter (not always `Date.now()`) so this stays deterministic
 * in tests and stories.
 */
export function formatDateTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) return `${time} today`

  const day = date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `${time} on ${day}`
}

const RELATIVE_UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
]

const relativeTimeFormat = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

/** The "(8 minutes ago)" half of Content rules' Time format, on its own — pairs with
 * `formatDateTime` wherever both are shown together. */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diffMs = new Date(iso).getTime() - now.getTime()

  for (const { unit, ms } of RELATIVE_UNITS) {
    if (Math.abs(diffMs) >= ms) {
      return relativeTimeFormat.format(Math.round(diffMs / ms), unit)
    }
  }
  return relativeTimeFormat.format(Math.round(diffMs / 1000), 'second')
}
