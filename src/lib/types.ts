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
  | 'running'
  /** The agent has finished; the policy checks are still running (docs/DECISIONS.md, 0061). */
  | 'checks_running'
  | 'blocked'
  | 'awaiting_review'
  | 'approved'
  | 'changes_requested'
  | 'rejected'

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
  /** Required for `changes_requested` and `rejected`, and for `approved` whenever a check
   * failed or did not run (`lib/openItems.ts`'s `approvalNeedsReason`; docs/DECISIONS.md, 0040). */
  reason?: string
  /** Every open item the reviewer ticked before approving — failed, not-run and waived gate
   * groups, a low confidence score, an open note (`lib/openItems.ts`'s `buildOpenItems`, whose
   * ids these are). Replaced `acknowledgedGateIds`, which covered only failed and waived gates:
   * see docs/DECISIONS.md, 0040. */
  acknowledgedItemIds: string[]
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
  acknowledgedItemIds: string[]
  revision: string
}

/**
 * One step of "What happened, in order" — the story tab (docs/DECISIONS.md, 0038). The agent's
 * own account of a phase of the run, in plain sentences, the same way `Run.summary` is: prose
 * is data, and every step links to the timeline events it describes. A step whose evidence
 * doesn't resolve is dropped (`lib/story.ts`), never shown unsourced. Its time or time range
 * is computed from that evidence, never written by hand.
 */
export interface StoryStep {
  id: string
  /** "Plan", "6 files changed" — shown after the time. */
  label: string
  text: string
  evidenceIds: string[]
  /** Confidence areas whose score belongs to this moment of the run. An area listed here but
   * missing from `Run.confidence` renders as "Not checked", never disappears. */
  confidenceAreas?: ConfidenceArea['area'][]
  /** Gates evaluated in this step. A failed or not-run gate gets its own card here. */
  gateIds?: string[]
  /** Show a "See N steps" link into the step list — for phases worth drilling into. */
  linkToSteps?: boolean
}

export interface Run {
  id: string
  initiative: string
  requestedBy: string
  /** The revision currently under review — what "Approve and release" would actually release,
   * and what a recorded `Decision.revision` should match if nothing has moved on since. Not
   * part of the spec's own data model (docs/spec-review-screen.md only gives `Decision` a
   * `revision`); added because the approve confirmation ("Release revision X to Y") needs a
   * real, sourced value to show before any decision exists — see docs/DECISIONS.md. */
  revision: string
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
  /** Why a person gave this work to the agent: "The shop is moving refunds... (context).
   * <by> gave the change to the agent because <reason>." Optional: a run started by a
   * schedule may have no one to name. */
  assignment?: { context: string; by: string; reason: string }
  /** The story tab. See `StoryStep`. */
  story: StoryStep[]
}
