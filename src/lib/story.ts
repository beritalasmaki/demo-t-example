import { confidenceLevel, resolveConfidenceAreas } from './confidence'
import type { ResolvedConfidenceArea } from './confidence'
import {
  formatCalendarDate,
  formatClock,
  formatCount,
  formatElapsed,
  formatRelativeTime,
  formatUtcOffset,
} from './format'
import { missingChecks } from './openItems'
import { resolveEvidenceIds } from './timeline'
import type { PolicyGate, Run, StoryStep, TimelineEvent } from './types'

/**
 * The story tab ("What happened, in order") — not UI. See src/lib/README.md and
 * docs/DECISIONS.md, 0038.
 */

export interface ChangedFile {
  /** The full path, from the event's `artefactIds`. */
  path: string
  /** "gateway-client.ts" — what the chip shows. */
  name: string
  /** Added (true) or edited (false), read from the event title's leading verb. */
  added: boolean
}

/** How a step's marker on the timeline spine reads: `attention` for something the reviewer
 * has to accept (a failed or not-run check, a Low score, a warning note), `key` for a step
 * carrying a score or the plan, `plain` for the rest. */
export type StoryStepTone = 'attention' | 'key' | 'plain'

export interface ResolvedStoryStep extends StoryStep {
  events: TimelineEvent[]
  startAt: string
  endAt: string
  confidence: ResolvedConfidenceArea[]
  gates: PolicyGate[]
  files: ChangedFile[]
  tone: StoryStepTone
}

function changedFiles(events: TimelineEvent[]): ChangedFile[] {
  return events
    .filter((event) => event.type === 'file_change')
    .flatMap((event) =>
      (event.artefactIds ?? []).map((path) => ({
        path,
        name: path.split('/').pop() ?? path,
        added: /^added\b/i.test(event.title),
      })),
    )
}

function toneFor(
  events: TimelineEvent[],
  gates: PolicyGate[],
  confidence: ResolvedConfidenceArea[],
): StoryStepTone {
  const needsAttention =
    gates.some((gate) => gate.result === 'fail' || gate.result === 'unknown') ||
    confidence.some((area) => !area.missing && confidenceLevel(area.value) === 'low') ||
    events.some((event) => event.severity === 'warning' || event.severity === 'error')
  if (needsAttention) return 'attention'
  if (confidence.length > 0 || events.some((event) => event.type === 'plan')) return 'key'
  return 'plain'
}

/**
 * `run.story` with each step's evidence resolved. A step whose evidence resolves to nothing is
 * dropped: a sentence with no evidence does not render (AGENTS.md, non-negotiable 3). Times
 * come from the evidence: the first and last event's `at`.
 */
export function resolveStory(run: Run): ResolvedStoryStep[] {
  const areas = resolveConfidenceAreas(run.confidence)
  const gatesById = new Map(run.gates.map((gate) => [gate.id, gate]))

  return run.story.flatMap((step) => {
    const events = resolveEvidenceIds(step.evidenceIds, run.timeline)
    if (events.length === 0) return []
    const times = events.map((event) => new Date(event.at).getTime())
    const confidence = (step.confidenceAreas ?? [])
      .map((area) => areas.find((resolved) => resolved.area === area))
      .filter((area): area is ResolvedConfidenceArea => area != null)
    const gates = (step.gateIds ?? [])
      .map((id) => gatesById.get(id))
      .filter((gate): gate is PolicyGate => gate != null)

    return [
      {
        ...step,
        events,
        startAt: new Date(Math.min(...times)).toISOString(),
        endAt: new Date(Math.max(...times)).toISOString(),
        confidence,
        gates,
        files: changedFiles(events),
        tone: toneFor(events, gates, confidence),
      },
    ]
  })
}

/**
 * "WHERE THE RUN IS NOW", before anyone decides: "Nothing has been released. The agent worked
 * for 1 h 49 min, changed 6 files, and left 2 checks without a result. Read the run below,
 * then decide."
 */
export function describePendingRun(run: Run): string {
  if (!run.finishedAt) return 'Nothing has been released. The agent is still working.'

  const elapsed = formatElapsed(
    new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime(),
  )
  const files = run.timeline.filter((event) => event.type === 'file_change').length
  if (run.status === 'checks_running') {
    return `Nothing has been released. The agent worked for ${elapsed} and changed ${formatCount(files, 'file')}. The checks are still running.`
  }
  const failed = run.gates.filter((gate) => gate.result === 'fail').length
  const unknown = run.gates.filter((gate) => gate.result === 'unknown').length
  const passed = run.gates.filter((gate) => gate.result === 'pass').length

  const checks: string[] = []
  if (failed > 0) checks.push(`${formatCount(failed, 'check')} failed`)
  if (unknown > 0) checks.push(`left ${formatCount(unknown, 'check')} without a result`)
  const checksClause =
    checks.length > 0
      ? checks.join(' and ')
      : passed === run.gates.length
        ? `all ${formatCount(passed, 'check')} passed`
        : `${passed} of ${formatCount(run.gates.length, 'check')} passed`

  return `Nothing has been released. The agent worked for ${elapsed}, changed ${formatCount(files, 'file')}, and ${checksClause}. Read the run below, then decide.`
}

/**
 * "WHERE THE RUN IS NOW", after a decision — everything after the decider's name, which the
 * page shows as a person pill: "approved revision e91a4c for payments-service in production on
 * 2026-09-23 at 12:06 (UTC+3), 3 minutes ago, with 2 checks still not run."
 */
export function describeDecision(run: Run, now: Date = new Date()): string | undefined {
  const decision = run.decision
  if (!decision) return undefined

  const when = `on ${formatCalendarDate(decision.at)} at ${formatClock(decision.at)} (${formatUtcOffset(new Date(decision.at))}), ${formatRelativeTime(decision.at, now)}`
  const missing = missingChecks(run).length

  switch (decision.outcome) {
    case 'approved':
      return `approved revision ${decision.revision} for ${run.target.system} in ${run.target.environment} ${when}${
        missing > 0 ? `, with ${formatCount(missing, 'check')} still not run` : ''
      }.`
    case 'changes_requested':
      return `sent revision ${decision.revision} back to the agent ${when}. Nothing was released.`
    case 'rejected':
      return `rejected revision ${decision.revision} ${when}. Nothing was released.`
  }
}
