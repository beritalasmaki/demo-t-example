# Agent run review — spec

## The situation

An AI agent has implemented a change to a customer's software: a few files, some tests, a
deployment plan. Before it is released, a human has to sign off. That human is usually not
the person who would have written the code: a compliance officer, a security lead, a
product owner. They have ten minutes and they carry the responsibility.

**The question the screen answers:** *Can I release this, and what am I signing?*

## Reviewer questions, in order

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

## Scenarios

Written as situations with a success and a failure test, not as "as a user I want…".
Each one becomes a Storybook story and a test.

**These are assumptions, not research.** No reviewers were interviewed for this project.
They are written as testable claims so that a real user session could confirm or break them,
and so that the reasoning behind each screen decision is visible.

### S1 · Failed check under time pressure

A reviewer opens a run that is awaiting review. One policy check has failed. The reviewer has
about ten minutes and several competing tasks.

- **Succeeds when** they know within 30 seconds which rule broke, what broke it, and what
  their options are — without opening the timeline.
- **Fails when** they approve without noticing the failed gate, or when understanding it
  requires reading the event log.

### S2 · Routine run with all checks passed

All checks passed. This is the most common case, and the highest risk one: repetition
turns approval into a reflex.

- **Succeeds when** the reviewer can see in one glance that every gate passed and what was
  checked, and the approval still asks them to confirm the one thing that matters: the
  revision and the target system.
- **Fails when** the screen congratulates them, hides what was checked behind a single
  green summary, or lets them approve without ever seeing the target environment.

### S3 · Granting an exception to a failed check

A check has failed, and this reviewer has the authority to let the change proceed anyway.

- **Succeeds when** the waiver requires a written reason, shows what risk is being accepted
  in the reviewer's own words, and is recorded with their name, the time and the exact
  gate — and when it reads afterwards as a decision someone made, not as a status the
  system produced.
- **Fails when** a waiver can be granted with one click, when the reason field accepts empty
  or meaningless input, or when a waived gate later looks the same as a passed one.

### S4 · Check did not run

One or more checks did not run, or the model reports no confidence value for an area.

- **Succeeds when** "not checked" is visibly different from "checked and fine", the screen
  says why it is unknown if that is known, and the reviewer can still make a decision while
  knowing exactly what they cannot see.
- **Fails when** missing data is shown as a neutral dash, rendered in the same style as a
  pass, or left out of the screen entirely.

### S5 · Run decided by another reviewer during review

Another reviewer approves the run while this reviewer is reading it.

- **Succeeds when** the page tells them what changed, who did it and when, keeps their
  place and any text they had written, and makes clear what they can still do — read the
  decision, or use the undo window if they have the right.
- **Fails when** the page silently reloads, their draft reason disappears, or their approval
  is accepted and applied twice.

### S6 · Release to a production environment

The same change, but the target environment is production, serving real users.

- **Succeeds when** the target environment is visible without scrolling, the decision step
  states the consequence in plain words ("this releases to production"), and the undo
  window is stated as a length of time.
- **Fails when** production looks identical to staging until the final dialog, or when the
  interface adds so much friction and warning colour that reviewers learn to click past it.

## Content rules

The words are most of the design here. Decide them once, use them everywhere: in the UI,
in Storybook, in the fixtures and in the tests.

**Use words people already know.** Where a standard term exists, use it. Reviewers in these
industries already know code review terms (approve, request changes, revision), CI terms
(check, passed, failed, skipped) and audit terms (audit log, evidence, exception, sign-off).
Inventing new names for these makes the product harder to trust, not more original.

**Voice.** Short sentences. Plain words. Say what happened, then what the reader can do.
No praise, no apologies, no exclamation marks.
Yes: "Two checks failed."
No: "Almost there — just a couple of things to fix!"

**Status names.** These exact labels, everywhere.

| Code value | Label | What it means |
| --- | --- | --- |
| `pass` | Passed | The rule is met. |
| `fail` | Failed | The rule is broken. |
| `waived` | Exception by *name* | A person allowed this to ship even though it failed. |
| `not_applicable` | Not applicable | This rule does not apply to this change. |
| `unknown` | Not run | The check did not run. We do not know the result. |

Run status: **Running · Blocked · Awaiting review · Approved · Changes requested ·
Rejected.** These match the words used in code review and CI tools.

("Exception" and "waiver" mean the same thing. The code uses `waived`; the screen says
"Exception", because that is the word used in audit and risk work.)

**Rule text.** Each check has one sentence that says what the rule requires. Write it as a
rule, not as an error message.
Yes: "Personal data must be deleted within 30 days."
No: "PII retention policy violation detected in booking_service.log."

Under it, one sentence that says what broke the rule, naming the thing:
"Email addresses are written to the booking log with no expiry."

**Missing results.** Always the same words: **Not run**, plus the reason when we know it.
"Not run — the security scanner timed out."
Never a dash, never a blank cell, never a grey icon alone. A missing result is information,
so it is written out like any other result.

**Numbers.** Never show a number alone. Show what it is based on, next to it.
"Confidence 72% — based on 14 passing tests covering 3 of 5 changed files."
No decimals: they would suggest a precision we do not have. Counts include the unit:
"3 files changed", not "3".

**Time.** Clock time first, relative time in brackets: "14:32 today (8 minutes ago)".
Reviewers need both. Show the time zone once, in the run header. Durations use the largest
sensible unit: "4 min 12 s".

**Buttons.** The label says what happens, not what the button does technically.

| Action | Label | The confirmation asks |
| --- | --- | --- |
| Approve | Approve and release | "Release revision *a1b2c3* to **production**? You can undo this for 10 minutes." |
| Request changes | Request changes | "What should change?" A written reason is required. |
| Reject | Reject run | "Why is this rejected?" A written reason is required. |
| Allow a failed check | Add exception | "What risk are you accepting, and why?" A written reason is required. |

Cancel is always there and never destructive. No "OK", no "Confirm", no "Are you sure?".

**Sign-off tick.** If a check failed or has an exception, approval needs one tick:
"I have seen 1 failed check and 1 exception." The sentence includes the count, so it is hard
to skip.

**Empty and error states.** Each one says what happened, why, and the next thing to do.
- Empty audit log: "No events yet. This run started 20 seconds ago."
- Failed load: "Could not load this run. The connection timed out. Retry."
- No rights: "You can read this run, but not decide on it. *name* can approve it."

**Who did what.** Every result, decision and exception names its source: a person by name,
or a system by name and version ("policy-engine v2.3"). Never "the system", never
"automatically".

**Sample data.** Made up, but believable: ordinary names, ordinary service names
("booking-service", "patient-portal"), realistic file paths. No real companies, no jokes, no
lorem ipsum. Believable content is part of the design.

## Hierarchy and disclosure

For each region: what is most important, what is secondary, and what stays hidden until the
reader asks for it. Nothing in the audit trail is ever deleted from the screen — it is
collapsed, and the collapse says how much is inside.

**Run header.** First: what system, which environment, and current status. Second: initiative
name and who requested it. Hidden until opened: agent version, model version, run id,
time zone detail. Never hidden: the environment, because it changes what approval means.

**Summary.** First: three to five plain sentences, each linking to its evidence. Second: counts
(files changed, tests, gates). Hidden: nothing — if a sentence needs hiding, it should not be
in the summary. Never hidden: any sentence describing a failure.

**Policy checks.** First: the result and the rule in plain language. Second: what broke it and
who evaluated it. Hidden until opened: raw check output, rule identifier, earlier evaluations.
Never hidden: a failed result or an exception, at any screen size.

**Audit log (timeline).** First: the shape of the run — how many steps, where it errored, where it
retried. Second: each event's title and time. Hidden until opened: payloads, diffs, full tool
output. Never hidden: errors and retries, and the fact that filters are active.

**Confidence.** First: what the model could not verify. Second: the value and its basis.
Hidden until opened: the model's longer reasoning. Never hidden: an area with no
confidence value at all.

**Decision.** First: the three actions and the acknowledgement of failed or waived gates.
Second: what exactly is being approved (revision, target). Hidden: nothing. After a decision,
first: who decided, when, and the undo window counting down.

## Acceptance criteria per region

Short and checkable; complements the definition of done in `AGENTS.md`.

**Run header**

- Environment is visible without scrolling, and production is distinguishable from staging
  by text, not only colour
- Status uses the exact labels above
- Long initiative names truncate without hiding the environment or status

**Summary**

- Every sentence links to evidence; a sentence with no evidence does not render
- Reads correctly when there are no failures and when there are several
- Never longer than five sentences

**Policy gates**

- All five results render, with icon and text, never colour alone
- Failed and waived sort above passed; order stays stable when data updates
- An exception shows who, when and why, and reads as a decision, not a status
- Each gate links to its evidence, and the link says what it leads to
- Keyboard: every gate opens and closes, focus stays where it was
- Empty, loading and unknown-result states exist as stories

**Timeline**

- Filters state what is hidden and how many items that is
- Errors and retries are visible with all filters on
- Long runs stay usable: 200+ events scroll without losing the header
- Each event's time is absolute with relative in brackets

**Confidence**

- "Could not verify" is listed before the number, for every area
- An area with no value shows "Not checked", with the reason when known
- No number appears without its basis next to it

**Decision**

- Approval is blocked until failed checks and exceptions are ticked
- Request changes and reject require a non-empty written reason
- The confirmation names the revision and the target environment
- After deciding: who, when, what revision, and a counting-down undo window
- Handles the case where the run was already decided by someone else

## Data model

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

## Interface states

Loading, empty timeline, partial data, stale data (the run moved on while reading),
network failure on the decision action, no permission to approve, and a run that was
already decided by someone else while this reviewer was reading.

## Out of scope

Multi-run dashboards, settings, authentication, mobile layouts, real backend.
