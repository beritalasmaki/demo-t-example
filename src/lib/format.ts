import type { ConfidenceLevel } from './confidence'
import type { ConfidenceArea, Decision, GateResult, PolicyGate, RunStatus } from './types'

/**
 * How values are turned into text. See src/lib/README.md and
 * docs/spec-review-screen.md, "Content rules". Rules like these live here, not in a
 * component, so a screen never has to decide the wording for itself.
 */

/**
 * Every `Intl`/`toLocale*` call below must pass this explicitly, never `undefined`.
 * `undefined` means "use the runtime's default locale" — which silently varies per browser
 * and OS, not per this app's own design (this has now broken the same way twice: first
 * 12-hour-vs-24-hour clock time, then relative-time strings rendering in Finnish —
 * "7 kuukautta sitten" — on a machine set to that locale). `scripts/check-format-locale.mjs`
 * enforces this mechanically as part of `npm run check`, not just by convention.
 */
const LOCALE = 'en'

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
 * The full label for a gate's result, as a reviewer reads it — "Exception by Kaisa Heinämäki"
 * for a waiver, the fixed label from Content rules for everything else.
 */
export function formatGateResultLabel(gate: PolicyGate): string {
  if (gate.result === 'waived' && gate.waiver) {
    return `Exception by ${gate.waiver.by}`
  }
  return GATE_RESULT_LABEL[gate.result]
}

/** Content rules, "Status names" — Run header's own status vocabulary: "Running · Blocked ·
 * Awaiting review · Approved · Changes requested · Rejected." These exact labels, everywhere. */
const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  running: 'Running',
  blocked: 'Blocked',
  awaiting_review: 'Awaiting review',
  approved: 'Approved',
  changes_requested: 'Changes requested',
  rejected: 'Rejected',
}

export function formatRunStatusLabel(status: RunStatus): string {
  return RUN_STATUS_LABEL[status]
}

/** Region 5's fixed vocabulary of areas, as a reviewer reads them. */
const CONFIDENCE_AREA_LABEL: Record<ConfidenceArea['area'], string> = {
  implementation: 'Implementation',
  tests: 'Tests',
  security: 'Security',
  side_effects: 'Side effects',
}

export function formatConfidenceAreaLabel(area: ConfidenceArea['area']): string {
  return CONFIDENCE_AREA_LABEL[area]
}

/** Region 6's three outcomes, as a reviewer reads them — "Approved", not "approved". */
const DECISION_OUTCOME_LABEL: Record<Decision['outcome'], string> = {
  approved: 'Approved',
  changes_requested: 'Changes requested',
  rejected: 'Rejected',
}

export function formatDecisionOutcomeLabel(outcome: Decision['outcome']): string {
  return DECISION_OUTCOME_LABEL[outcome]
}

/**
 * Content rules, "Time": "Show the time zone once, in the run header." A short abbreviation
 * (e.g. "UTC"), not the full IANA name — that's shown in the header's own hidden detail
 * instead, since it's not needed at a glance every time a clock time is shown.
 */
export function formatTimeZoneLabel(now: Date = new Date()): string {
  const part = new Intl.DateTimeFormat(LOCALE, { timeZoneName: 'short' })
    .formatToParts(now)
    .find((p) => p.type === 'timeZoneName')
  return part?.value ?? ''
}

/**
 * Content rules, "Time": "Clock time first, relative time in brackets: '14:32 today (8
 * minutes ago)'." `now` is a parameter (not always `Date.now()`) so this stays deterministic
 * in tests and stories.
 */
export function formatDateTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  // The spec's own example ("14:32") is 24-hour. Locale-default AM/PM would silently drift
  // from that the moment this runs somewhere en-US isn't the assumed locale.
  const time = date.toLocaleTimeString(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) return `${time} today`

  const day = date.toLocaleDateString(LOCALE, {
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

const relativeTimeFormat = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' })

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

/** Content rules, "Time": "Durations use the largest sensible unit: '4 min 12 s'." Used for
 * the undo window's countdown, which never runs long enough to need an hour. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes === 0) return `${seconds} s`
  return `${minutes} min ${seconds} s`
}

/**
 * Content rules, "Numbers": "No decimals: they would suggest a precision we do not have."
 * `ConfidenceArea.value` is 0..1; this is the whole-percentage form every confidence value is
 * shown as, always paired with its basis (`ConfidencePanel`), never shown alone.
 */
export function formatConfidencePercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * "10:02" — the reviewer's local clock time, 24-hour, with no date or zone. Used inside the
 * story and step list, where the date and zone are shown once, in the header (Content rules,
 * "Time"). Built from `getHours`/`getMinutes` rather than `toLocaleTimeString`, so no locale is
 * involved at all.
 */
export function formatClock(iso: string): string {
  const date = new Date(iso)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** "10:24–10:50", or a single "10:02" when both ends fall in the same minute. */
export function formatClockRange(startIso: string, endIso: string): string {
  const start = formatClock(startIso)
  const end = formatClock(endIso)
  return start === end ? start : `${start}–${end}`
}

/** "2026-09-23" in the reviewer's local zone — one unambiguous date format everywhere the
 * date is part of the record (docs/DECISIONS.md, 0042). */
export function formatCalendarDate(iso: string): string {
  const date = new Date(iso)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** "UTC+3", "UTC+5:30", "UTC-4", or "UTC" — the offset written the same way on every system,
 * unlike a zone abbreviation ("EEST", "GMT+3"), which depends on the runtime's time-zone data. */
export function formatUtcOffset(now: Date = new Date()): string {
  const offset = -now.getTimezoneOffset()
  if (offset === 0) return 'UTC'
  const sign = offset > 0 ? '+' : '-'
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  return `UTC${sign}${hours}${minutes ? `:${pad(minutes)}` : ''}`
}

/** How long a run took: "1 h 49 min", "6 min". The largest sensible unit (Content rules,
 * "Time") — a run is measured in minutes and hours, the undo countdown (`formatDuration`) in
 * minutes and seconds. */
export function formatElapsed(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60_000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} min`
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`
}

/** "1 check", "2 checks" — Content rules, "Numbers": counts include the unit. */
export function formatCount(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

const CONFIDENCE_LEVEL_LABEL: Record<ConfidenceLevel, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export function formatConfidenceLevelLabel(level: ConfidenceLevel): string {
  return CONFIDENCE_LEVEL_LABEL[level]
}

/** What a reviewer should do about a score at this level, before deciding — so a percentage
 * always comes with what it means for them (docs/DECISIONS.md, 0041). */
const CONFIDENCE_ACTION: Record<ConfidenceLevel, string> = {
  high: 'No action needed',
  medium: 'Worth a look before approving',
  low: 'Check this yourself before approving',
}

export function formatConfidenceAction(level: ConfidenceLevel): string {
  return CONFIDENCE_ACTION[level]
}
