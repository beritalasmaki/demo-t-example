import { resolveConfidenceAreas } from './confidence'
import { formatConfidenceAreaLabel, formatConfidencePercent } from './format'
import { gateAttentionGroups } from './gates'
import type { GateAttentionGroup } from './gates'
import type { Run } from './types'

/**
 * Small domain helper for the "Before you rely on this" digest — not UI, not one of
 * docs/spec-review-screen.md's six regions. It synthesizes the handful of things most worth
 * a reviewer's attention before they decide, from real `Run` data only (AGENTS.md
 * non-negotiable 3: "no claim without a source") — nothing here is invented to read well.
 */
export interface AttentionItem {
  id: string
  /** Bold lead-in, e.g. "2 checks did not run." */
  lead: string
  /** Supporting sentence — the specific gates/area/note the lead is about. */
  body?: string
  linkHref: string
  linkLabel: string
}

const GATE_GROUP_LEAD: Record<GateAttentionGroup['result'], (n: number) => string> = {
  fail: (n) => `${n} check${n === 1 ? '' : 's'} failed.`,
  unknown: (n) => `${n} check${n === 1 ? '' : 's'} did not run.`,
  waived: (n) => `${n} exception${n === 1 ? '' : 's'} granted.`,
}

function gateGroupItems(run: Run): AttentionItem[] {
  return gateAttentionGroups(run.gates).map((group) => ({
    id: `attention-gates-${group.result}`,
    lead: GATE_GROUP_LEAD[group.result](group.gates.length),
    body: `${group.gates.map((gate) => gate.name).join(', ')}.`,
    linkHref: '#policy-gates-heading',
    linkLabel: 'See policy gates',
  }))
}

/**
 * The single weakest confidence area — among areas the model actually reported a value for,
 * the lowest one that also names something specific it could not verify. An area with nothing
 * unverified has nothing concrete to flag here (never a bare "confidence is low" judgment —
 * see docs/DECISIONS.md), and a missing area is already always-visible in the Confidence
 * region itself ("Not checked"), so it doesn't need repeating here too.
 */
function confidenceItem(run: Run): AttentionItem | undefined {
  const weakest = resolveConfidenceAreas(run.confidence)
    .filter((area) => !area.missing && area.unverified.length > 0)
    .sort((a, b) => (a.missing || b.missing ? 0 : a.value - b.value))[0]

  if (!weakest || weakest.missing) return undefined

  return {
    id: `attention-confidence-${weakest.area}`,
    lead: `${formatConfidenceAreaLabel(weakest.area)} confidence is ${formatConfidencePercent(weakest.value)}.`,
    body: weakest.unverified[0],
    linkHref: '#confidence-heading',
    linkLabel: 'See confidence',
  }
}

/**
 * Timeline notes flagged `severity: 'warning'` — an operational caveat the agent recorded
 * (e.g. "the nightly reconciliation job was not re-run against this change") that isn't a
 * gate result or a confidence value, but is still worth knowing before relying on the run.
 * `severity: 'error'` events are deliberately excluded: those are already always-visible in
 * the Audit log's own step/error/retry summary, not a separate caveat to repeat here.
 */
function noteItems(run: Run): AttentionItem[] {
  return run.timeline
    .filter((event) => event.type === 'note' && event.severity === 'warning')
    .map((event) => ({
      id: `attention-note-${event.id}`,
      lead: event.title,
      body: event.detail,
      linkHref: `#timeline-event-${event.id}`,
      linkLabel: 'See audit log',
    }))
}

export function buildAttentionItems(run: Run): AttentionItem[] {
  const confidence = confidenceItem(run)
  return [...gateGroupItems(run), ...(confidence ? [confidence] : []), ...noteItems(run)]
}
