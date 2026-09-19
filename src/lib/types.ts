/**
 * The shape of an agent run and everything a reviewer needs to decide on it.
 *
 * This is the data model from docs/spec-review-screen.md, with doc comments added so each
 * code value's on-screen label (docs/spec-review-screen.md, "Content rules") is visible right
 * next to the value it belongs to. The labels themselves are not turned into runtime lookups
 * here — see src/lib/README.md: "how values are turned into text... live [in format.ts], not
 * in a component." types.ts stays the shape of the data; format.ts (not built yet) is where a
 * GateResult or RunStatus actually becomes the string a reviewer reads.
 *
 * Everything else in the app refers to these types, per src/lib/README.md: a change here
 * shows up as a compiler error everywhere it matters.
 */

/**
 * Region 1 (Run header). Content rules' exact labels, in order:
 * Running · Blocked · Awaiting review · Approved · Changes requested · Rejected.
 */
export type RunStatus =
  'running' | 'blocked' | 'awaiting_review' | 'approved' | 'changes_requested' | 'rejected'

/**
 * Region 3 (Policy gates). Content rules' exact labels:
 *   pass           -> "Passed"
 *   fail           -> "Failed"
 *   waived         -> "Exception by <name>" (the name comes from `PolicyGate.waiver.by`,
 *                     not from this value alone — "waived" and "waiver" mean the same thing;
 *                     the code says `waived`, the screen says "Exception", because that is
 *                     the word used in audit and risk work)
 *   not_applicable -> "Not applicable"
 *   unknown        -> "Not run" (plus the reason, when known, from evidence/the timeline —
 *                     never a bare dash, never hidden)
 */
export type GateResult = 'pass' | 'fail' | 'waived' | 'not_applicable' | 'unknown'

export interface PolicyGate {
  id: string
  /** "Data retention" */
  name: string
  /** One sentence a non-engineer understands. Written as a rule, not an error message. */
  plainLanguage: string
  result: GateResult
  /** "policy-engine v2.3", or a person's name for a manually reviewed gate. */
  evaluatedBy: string
  /** ISO timestamp. */
  evaluatedAt: string
  /** Links into the timeline (or, later, other artefacts) — the evidence behind this result. */
  evidenceIds: string[]
  /** A waiver is a decision a person made, not a status the system produced — always named. */
  waiver?: { by: string; reason: string; at: string }
}

export interface TimelineEvent {
  id: string
  /** ISO timestamp. */
  at: string
  /**
   * Region 4 (Timeline). There is no dedicated "retry" value: a retry is a later event
   * (usually `test_run` or `tool_call`) whose `title` says it is one, following the `error`
   * it retried after — see src/fixtures/run-blocked.ts for a worked example.
   */
  type: 'plan' | 'tool_call' | 'file_change' | 'test_run' | 'gate_eval' | 'error' | 'note'
  title: string
  detail?: string
  artefactIds?: string[]
  severity?: 'info' | 'warning' | 'error'
}

export interface ConfidenceArea {
  /** Region 5. The fixed set of areas a run can report confidence for. */
  area: 'implementation' | 'tests' | 'security' | 'side_effects'
  /** 0..1. An area the model reports no confidence for is simply absent from `Run.confidence` —
   * there is no "unknown" confidence value, so "no value" is modeled by omission, not by a
   * placeholder number. (Acceptance criteria: "An area with no value shows 'Not checked'.") */
  value: number
  /** How the value was derived — shown next to the number, never a bare percentage. */
  basis: string
  /** The model's short reasoning. */
  rationale: string
  /** What it could not verify — shown before the number (Acceptance criteria, Confidence). */
  unverified: string[]
}

/**
 * Region 6 (Decision). What a reviewer submits; see also `DecisionInput` below, which is what
 * gets sent to `submitDecision` before the server (here, `lib/api.ts`) turns it into one of
 * these by filling in `at`.
 *
 * The spec's data model has no field for the undo window described elsewhere in the same
 * document (Region 6, "Hierarchy and disclosure", "Acceptance criteria"). It is deliberately
 * not added here: it is modeled as `at` plus a fixed policy, not stored data — see
 * docs/DECISIONS.md.
 */
export interface Decision {
  outcome: 'approved' | 'changes_requested' | 'rejected'
  by: string
  /** ISO timestamp. */
  at: string
  /** Required for `changes_requested` and `rejected`; not required for `approved`
   * (Content rules, "Buttons"). */
  reason?: string
  /** Content rules, "Sign-off tick": every failed or waived gate the reviewer confirmed
   * having seen. The rule as written does not extend this to `unknown` gates. */
  acknowledgedGateIds: string[]
  /** What exactly was approved — guards against deciding on a run that has moved on. */
  revision: string
}

/**
 * What a reviewer submits to `submitDecision`. Not part of the spec's own data model; added
 * because `submitDecision` needs an input shape distinct from the `Decision` it produces —
 * see docs/DECISIONS.md for why `by` is here instead of being inferred from a session.
 */
export interface DecisionInput {
  outcome: Decision['outcome']
  by: string
  reason?: string
  acknowledgedGateIds: string[]
  revision: string
}

export interface Run {
  id: string
  initiative: string
  requestedBy: string
  target: { system: string; environment: 'dev' | 'staging' | 'production' }
  agent: { name: string; version: string; model: string }
  /** ISO timestamp. */
  startedAt: string
  /** ISO timestamp. */
  finishedAt?: string
  status: RunStatus
  /** Region 2. Three to five plain sentences, each linked to its evidence. A sentence with
   * no evidence does not belong here (Acceptance criteria, Summary). */
  summary: { text: string; evidenceIds: string[] }[]
  gates: PolicyGate[]
  timeline: TimelineEvent[]
  confidence: ConfidenceArea[]
  decision?: Decision
}
