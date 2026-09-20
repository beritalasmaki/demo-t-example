# features/run

The agent run review view. Everything here knows what this product is about: runs, gates,
confidence, decisions. Parts that would work in any other product belong in
`src/components/` instead.

The full content spec is in `docs/spec-review-screen.md`. This file explains the words.

## Glossary

**Run** — one job carried out by an AI agent: it received a task, made a plan, changed files,
ran tests, and produced a result. A run is what this screen reviews.

**Agent** — the AI that did the work. It acts on its own, but it does not decide whether the
result is released.

**Policy gate** — a rule the change has to pass before release. The company defines the rule
in advance and the system checks it automatically. Example: *personal data must be deleted
within 30 days*. If the agent wrote code that stores email addresses with no expiry, that
gate fails.

Every gate is shown with: the rule's name, the rule in plain language, the result, what broke
it, who or what evaluated it, and a link to the evidence.

A gate can be:

- **pass** — the rule is met
- **fail** — the rule is broken
- **not applicable** — the rule does not concern this change
- **unknown** — the check could not be run; this is shown, never hidden
- **waived** — a person decided the change may proceed anyway. A waiver always names who
  decided, when, and why. A waiver is a decision, not a status.

**Evidence** — the data behind a claim: log events, test results, changed files. Every value
on screen links to its evidence. A number without a source is not proof.

**Timeline** — what the agent did, step by step, in order: plan, tool calls, file changes, test
runs, gate evaluations, errors, retries. This is the audit trail, so it can be collapsed but
never hidden.

**Confidence** — how sure the model is about part of its own work, plus the reasoning and,
most importantly, what it could not verify. Low confidence is normal information, not an
alarm.

**Decision** — the human's answer: approve, request changes, or reject. Recorded with the
person, the time, the exact revision approved, and any gates they acknowledged. Reversible
within the undo window before release.

**Reviewer** — the person making that decision. Usually not the person who would have
written the code: a compliance officer, a security lead, a product owner. Design for them.

## Files

- `RunReviewPage.tsx` — composes the regions, owns the view state
- `useRun.ts` — loading, error and stale-data handling via `lib/api`
- `RunHeader.tsx`, `RunSummary.tsx` — what this run is, in three to five sourced sentences
- `PolicyGateList.tsx`, `PolicyGateRow.tsx` — gates, failed and waived first
- `Timeline.tsx`, `TimelineEventRow.tsx`, `TimelineFilters.tsx` — the audit trail. Named
  `TimelineEventRow`, not `TimelineEvent` as originally planned here: that name already
  belongs to `lib/types.ts`'s `TimelineEvent`, needed in the same file.
- `ConfidencePanel.tsx` — confidence, reasoning, and what was not verified
- `DecisionBar.tsx`, `DecisionDialog.tsx` — the decision, its reason and its consequences
