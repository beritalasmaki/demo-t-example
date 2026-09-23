import { resolveEvidenceIds } from './timeline'
import type { GateResult, PolicyGate, TimelineEvent } from './types'

/**
 * Small domain helpers for policy gates — not UI. See src/lib/README.md.
 */

/**
 * Region 3 / Acceptance criteria: "Failed and waived sort above passed; order stays stable
 * when data updates." The full order, per docs/spec-review-screen.md: failed and exceptions
 * first (tied — the spec does not rank one above the other), then unknown, then not
 * applicable, then passed. `Array.prototype.sort` is stable (guaranteed since ES2019), so
 * gates within the same tier keep their original relative order.
 */
const SORT_RANK: Record<GateResult, number> = {
  fail: 0,
  waived: 0,
  unknown: 1,
  not_applicable: 2,
  pass: 3,
}

export function sortGates(gates: PolicyGate[]): PolicyGate[] {
  return [...gates].sort((a, b) => SORT_RANK[a.result] - SORT_RANK[b.result])
}

/**
 * A gate's `evidenceIds` point into the timeline (docs/spec-review-screen.md, Data model:
 * "links into the timeline or artefacts"). This resolves them to the actual events, which is
 * what "what broke it", the reason a gate is `unknown`, and the evidence list itself all turn
 * out to be — the fixtures encode all three as a linked timeline event's `detail`, not as a
 * separate field on `PolicyGate`. See `resolveEvidenceIds` in `lib/timeline.ts` for how
 * dangling ids are handled.
 */
export function resolveEvidence(gate: PolicyGate, timeline: TimelineEvent[]): TimelineEvent[] {
  return resolveEvidenceIds(gate.evidenceIds, timeline)
}

/**
 * The one sentence that says what broke the rule (fail), why it wasn't checked (unknown), or
 * why it doesn't apply (not_applicable) — the first resolved evidence event that has a
 * `detail`. `pass` never needs one: there is nothing to explain about a rule that was met.
 */
export function explanationFor(gate: PolicyGate, timeline: TimelineEvent[]): string | undefined {
  if (gate.result === 'pass') return undefined
  const evidence = resolveEvidence(gate, timeline)
  // The gate's own evaluation says why it failed or did not run; a file change listed as
  // evidence only says what the check looked at. Without this preference, run-messy's
  // licensing gate explained itself with its first evidence event — a file's description.
  const evaluation = evidence.find((event) => event.type === 'gate_eval' && event.detail)
  return (evaluation ?? evidence.find((event) => event.detail))?.detail
}
