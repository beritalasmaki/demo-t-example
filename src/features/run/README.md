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

The page is the "story layout" (docs/DECISIONS.md, 0038): an overview header, three views of
the run, and a right column that stays in place.

- `RunReviewPage.tsx` — composes the page and handles loading, not-found and failed-load
  states once. Holds the run in local state, so a decision, a conflict or an undo updates the
  screen straight away, without a refetch. Owns which view is open, whether the overview's
  details are shown, and where focus goes when the view changes: the view's heading after a
  tab, or one step's row after a link into the step list (docs/DECISIONS.md, 0044).
- `RunTopBar.tsx` — sticky: breadcrumb back to "My reviews", and the Story / Evidence / All N
  steps tab list. No logo or main menu: the page sits inside a host platform (0042).
- `RunOverview.tsx` — status, initiative, why the agent was asked, where the run is now, the
  labelled facts (requested by, agent, ran, checks, lowest score, target, revision, run
  reference), and one box on the right: what is open (before a decision) or `UndoBox` (after).
  Collapses to one compact row after the first view change, with "Show details" / "Hide
  details" on its bottom border.
- `UndoBox.tsx` — the live undo countdown and the one filled Undo button (0017, 0033).
- `StoryTimeline.tsx` — "What happened, in order": `Run.story` on a timeline spine, ending on
  "Waiting for a decision" or the decision and its reason. Uses `ScoreCard` and `CheckCard`
  where scores and checks happened.
- `ScoreCard.tsx` — one confidence score: percentage, level, action, basis, what could not be
  checked, and "Why this score" (0041). A missing area shows "Not checked".
- `CheckCard.tsx` — a check that failed, did not run, or has an exception. Before a decision,
  "Run check again" (local only) gives a way forward.
- `EvidenceTab.tsx` — every event the page's claims rest on, grouped by what it supports.
- `StepsTab.tsx` — the full audit log, one row per step, with long repeated runs folded.
- `DecisionPanel.tsx` — "Your decision": tick each open item, a reason (required when a check
  is missing), then Approve and release, or Request changes / Reject run (0039, 0040). Each
  action opens `DecisionDialog`.
- `DecisionDialog.tsx` — the confirmation (it names the revision and target) or the reason
  form behind each action, plus a failed submit and Scenario S5's conflict.
- `UnverifiedList.tsx` — "What is not checked" before a decision, "What is still unverified"
  after, with "Copy this list for the record".
- `RunShape.tsx` — the run in five counted numbers, shown after a decision.
- `ReviewList.tsx` — "My reviews", a minimal list for navigation only.
- `ActorName.tsx` — the shared "who did this" display: a person gets a pill, a system stays
  plain icon + text (0023).
- `SectionHeading.tsx` — the region heading with its scanning icon.
- `currentReviewer.ts` — the stand-in identity of whoever is using the page (no sign-in yet).
- `useRun.ts` — loading, not-found and error handling around `lib/api`'s `getRun`.
