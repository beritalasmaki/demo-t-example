# Agent run review — spec

## The situation

An AI agent has implemented a change to a customer's software: a few files, some tests, a
deployment plan. Before it is released, a human has to sign off. That human is usually not
the person who would have written the code: a compliance officer, a security lead, a
product owner. They have ten minutes and they carry the responsibility.

**The question the screen answers:** *Can I release this, and what am I signing?*

## Reviewer questions, in the order they are asked

1. What was asked for, and by whom?
2. What did the agent actually do?
3. What checked it, and what did those checks say?
4. Where is it uncertain, and why?
5. What happens if I approve — and can this be undone?

The layout should follow that order. Anything that does not answer one of these questions
is a candidate for removal.

## Regions

**1. Run header** — what this is: initiative name, requesting person, target system,
environment, agent and model version, started/finished time, current status. Status values:
`running`, `blocked`, `awaiting_review`, `approved`, `changes_requested`, `rejected`.

**2. Summary** — three to five plain sentences generated from the run, each linked to its
evidence. "Added a rate limit to the public booking API. Two files changed, 14 tests added,
all passing. One policy gate failed: data retention." No adjectives, no reassurance.

**3. Policy gates** — the checks the change has to pass: security, data protection,
architecture, licensing, test coverage, accessibility. Each gate shows: name, plain-language
description, result (`pass` / `fail` / `waived` / `not_applicable` / `unknown`), who or what
evaluated it, when, and a link to the evidence. Failed and waived gates sort to the top.
A waiver always names the human who granted it and their reason — a waiver is a decision,
not a state.

**4. Timeline** — what the agent did, step by step: plan, tool calls, file changes, test runs,
gate evaluations, retries and errors. Filterable by event type. Dense rows, expandable for
detail. This is the audit trail, so nothing is ever hidden, only collapsed.

**5. Confidence and rationale** — per area (implementation, tests, security, side effects):
a confidence value, the model's short reasoning, and — most important — what it says it
could not verify. Show the number and the basis for it next to each other; a bare percentage
is not evidence. Low confidence is normal and should look normal, not alarming.

**6. Decision** — approve, request changes, or reject. Requesting changes and rejecting
require a written reason. Approving requires the reviewer to confirm they have seen any
failed or waived gate. After the decision: who decided, when, on what version, and an
undo window before release.

## Data model (starting point)

```ts
type RunStatus =
  | "running" | "blocked" | "awaiting_review"
  | "approved" | "changes_requested" | "rejected";

type GateResult = "pass" | "fail" | "waived" | "not_applicable" | "unknown";

interface PolicyGate {
  id: string;
  name: string;               // "Data retention"
  plainLanguage: string;      // one sentence a non-engineer understands
  result: GateResult;
  evaluatedBy: string;        // "policy-engine v2.3" | person id
  evaluatedAt: string;        // ISO
  evidenceIds: string[];      // links into the timeline or artefacts
  waiver?: { by: string; reason: string; at: string };
}

interface TimelineEvent {
  id: string;
  at: string;
  type: "plan" | "tool_call" | "file_change" | "test_run" | "gate_eval" | "error" | "note";
  title: string;
  detail?: string;
  artefactIds?: string[];
  severity?: "info" | "warning" | "error";
}

interface ConfidenceArea {
  area: "implementation" | "tests" | "security" | "side_effects";
  value: number;              // 0..1
  basis: string;              // how it was derived
  rationale: string;
  unverified: string[];       // what the model could not check
}

interface Decision {
  outcome: "approved" | "changes_requested" | "rejected";
  by: string;
  at: string;
  reason?: string;
  acknowledgedGateIds: string[];
  revision: string;           // what exactly was approved
}

interface Run {
  id: string;
  initiative: string;
  requestedBy: string;
  target: { system: string; environment: "dev" | "staging" | "production" };
  agent: { name: string; version: string; model: string };
  startedAt: string;
  finishedAt?: string;
  status: RunStatus;
  summary: { text: string; evidenceIds: string[] }[];
  gates: PolicyGate[];
  timeline: TimelineEvent[];
  confidence: ConfidenceArea[];
  decision?: Decision;
}
```

## Fixtures to build

Three runs, because the interesting design work is in the bad cases:

1. **Clean** — everything passed, awaiting review. Should be boring and fast to approve.
2. **Blocked** — one gate failed, one waived, low confidence on side effects, one agent
   error and retry in the timeline.
3. **Messy** — long run, missing data (`unknown` gates, no confidence for one area),
   a change to production, and an already-recorded decision with an undo window.

## States to design, not just the happy one

Loading, empty timeline, partial data, stale data (the run moved on while reading),
network failure on the decision action, no permission to approve, and a run that was
already decided by someone else while this reviewer was reading.

## Out of scope for v1

Multi-run dashboards, settings, authentication, mobile layouts, real backend.
