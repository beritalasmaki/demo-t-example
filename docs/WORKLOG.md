# Worklog

One entry per work session, newest first. Written so that a designer can repeat the same
work by hand. Agents: copy the template, fill every field, keep it short and concrete.

---

## Template

### YYYY-MM-DD · <short title>

**Goal**
One sentence: what we set out to do.

**What changed**
Bullet list of files and what happened in each. Mention the commit(s).

**Steps, in order**
Numbered list of the actual steps, with the commands run. Write it as instructions, not as
a story: "1. Created `src/lib/types.ts` and defined `Run`, `TimelineEvent`, `PolicyGate`."
Include the exact commands (`npm create vite@latest`, `npx shadcn@latest add table`, …).

**Why it was done this way**
The reasoning behind the non-obvious choices. If there was a trade-off worth keeping,
also add it to `DECISIONS.md`.

**How to do this by hand**
The manual version of the same work, for learning: which files to create, what to click in
Figma or Storybook, what to check. Skip this field only when it is identical to the steps.

**Verification**
What was run and what the result was: `npm run check`, tests, manual keyboard pass,
contrast check, screenshots taken.

**Open questions / next**
What is unfinished, uncertain, or should be decided by a human.

---

<!-- New entries go below this line, newest first. -->

### 2026-09-20 · Timeline (audit log): Timeline, TimelineEventRow, TimelineFilters

**Goal**
Build the audit log region against `run-messy` for length and `run-blocked` for the
error/retry case, following `docs/spec-review-screen.md`'s Region 4 and its Hierarchy
exactly: the shape of the run first, never a flat list; errors and retries never hidden by
filters.

**What changed**
- `src/fixtures/run-messy.ts` (+ test) — extended the timeline from 20 to 200+ events.
- `src/styles/index.css`, `docs/DECISIONS.md` — a real bug fix, unrelated to Timeline itself
  but found while building it (see below).
- `src/components/IconText.tsx`, `src/components/ToggleChip.tsx` (+ stories, tests).
- `src/lib/timeline.ts` (+ test).
- `src/features/run/TimelineEventRow.tsx`, `TimelineFilters.tsx`, `Timeline.tsx` (+ stories,
  tests).
- `src/features/run/README.md`, `src/lib/README.md` — corrected/extended file listings.
- Commits: `fb1e481` (fixture), `5b53ae2` (border fix), `2bf3308` (IconText/ToggleChip),
  `50a3faa` (lib/timeline.ts), `a711eaf` (TimelineEventRow), `eb1f104` (TimelineFilters),
  `5a033d7` (Timeline), `a8f1c08` (README corrections).

**Steps, in order**
1. Read `AGENTS.md` and `docs/spec-review-screen.md` fresh, then checked `run-messy.ts`'s
   actual timeline length before planning — 20 events, not 200+. Flagged it and extended the
   fixture for real, per the task's own instruction not to fake the scale test in stories
   only: the narrative reason (verifying a refund path against every shard in a sharded
   payments system) came before the generation code, not after — 180 near-identical events
   needed a real reason to be believable, not just a reason to exist.
2. Wrote `lib/timeline.ts` before any component: `isRetry`/`isError`, `timelineShape`, and
   `filterTimeline` — the last of these is where "never hidden by filters" actually lives,
   not in row styling, so it could be tested in isolation before any UI existed to hide the
   bug behind.
3. Verified every new lucide-react icon name (7 event types) actually exists before writing
   `TimelineEventRow`, same as the icon check from the previous PolicyGateRow session.
4. Building `ToggleChip`, tried `border-border` for the first time anywhere in this codebase
   and it silently resolved to the wrong colour. Traced it with a probe build (not assumed):
   the shadcn bridge in `index.css` had been redeclaring `--color-border` to equal
   `--color-border-subtle` since the design-system session, two sessions ago — the exact same
   class of collision already caught and fixed for `--color-accent`, just missed for
   `border` because nothing had used it directly until now. Fixed it, then deliberately
   audited the rest of shadcn's bridge vocabulary (`primary`, `secondary`, `muted`,
   `destructive`, `ring`, `input`) the same way — probe-built and checked the resolved value
   — rather than assume `border` was the only one. It was; `primary` is the one other
   exact-name overlap, and it isn't a collision, since both sides already agree on the value.
5. Built `TimelineEventRow`. Deliberately did *not* wrap a detail-less event in a `Disclosure`
   with an empty body — most of the 200 shard-check events have no detail at all, and an
   expand arrow leading to nothing would be a small invented interaction with no real content
   behind it. Gave the plain and the expandable row the same visual "card" treatment instead,
   so a 200-event list reads as one consistent sequence.
6. Built `TimelineFilters`, then `Timeline`, wiring `filterTimeline`'s forced-visible ids
   through to a "Shown despite the active filters" note on the row, so an event surviving an
   unchecked filter reads as intentional, not as a bug.
7. Built a static Storybook bundle, served it locally, and screenshotted the `Messy`
   (all 200 real events), `Filtered`, `Empty` and `Blocked` stories in both themes with the
   environment's global Playwright CLI, the same verification pattern as the previous two
   sessions. This is what confirmed the bounded scroll region actually clips the list rather
   than just having the CSS class present, that the empty state matches Content rules'
   example wording exactly, and that a severity-flagged failed `gate_eval` correctly counts
   as an "error" in the shape summary alongside the one literal `error`-type event.
8. Updated `features/run/README.md` (still said `TimelineEvent.tsx`; the real file is
   `TimelineEventRow.tsx`, to avoid colliding with `lib/types.ts`'s own `TimelineEvent`) and
   `lib/README.md` (didn't mention `timeline.ts` at all) — the `new-component` skill's "update
   the folder README if the rule changed" step, done as its own small commit rather than
   folded silently into the component commits.

**Why it was done this way**
- The `--color-border` bug is worth naming plainly: it is not a Timeline bug, and it existed
  in already-shipped, already-tested code for two full sessions before anything happened to
  use the one Tailwind utility name that triggered it. Nothing in `npm run check` — not
  `tsc`, not `eslint`, not a single existing unit test — could have caught it, because none
  of them render actual computed CSS and compare it to an expectation. Only trying to use the
  token directly, and checking the *build output* rather than the *source*, surfaced it. This
  is the same lesson as the 24-hour clock bug from the PolicyGateRow session, generalised:
  reading tokens.css and index.css correctly, twice, was not enough.
- Auditing the rest of the shadcn bridge immediately, rather than filing it as "worth doing
  later," was a deliberate choice: the previous session's own `DECISIONS.md` entry for the
  accent collision speculated that other collisions might exist without checking, and this
  session found one it hadn't predicted (`border`, not one of the ones that seemed obviously
  risky). A speculative "should audit sometime" note has a way of never actually happening.

**How to do this by hand**
Before trusting that a design-system token bridge is correct, don't just read both files side
by side — build the app, add the exact Tailwind utility class you're about to rely on to a
throwaway element, build again, and grep the *output* CSS for what it actually resolved to.
Do this for every semantic token name your product happens to share with whatever
third-party component vocabulary you're bridging to (here, shadcn's `background`, `border`,
`ring`, `primary`, …), not just the one you're about to use — a silent override in a shared
bridge file affects every future consumer of that name, not only the one that happens to
reveal it first.

**Verification**
`npm run check` green after every commit (101 tests by the end, up from 90). `npx storybook
build` succeeded and was actually rendered in both themes for the primary states, via a
static build served locally and screenshotted with the environment's global Playwright.
Confirmed the `--color-border` bug and its fix with before/after probe builds, not by reading
the CSS source and assuming it was right.

**Open questions / next**
- No `RunReviewPage.tsx` exists yet, so "the run header" the acceptance criteria say must
  stay visible alongside a scrolling Timeline is not a real, composed layout yet — this
  session's `max-h-96` bound is Timeline's own internal scroll, not yet proven against an
  actual page with a real header above it.
- The `border`/`accent` shadcn-bridge collision pattern is now caught twice. Worth deciding,
  before a real shadcn component is ever added, whether to rename our tokens away from
  shadcn's exact vocabulary preemptively, or keep resolving collisions as they're found —
  currently the latter, by default, not by an explicit decision.


### 2026-09-19 · PolicyGateList and PolicyGateRow, plus the lib helpers they need

**Goal**
Build the first two real product components — `PolicyGateList` and `PolicyGateRow` — against
`run-messy` as the primary fixture, following `docs/spec-review-screen.md` for the five
results, sort order, and content rules exactly.

**What changed**
- `src/lib/gates.ts`, `src/lib/format.ts` (+ tests) — documented in `lib/README.md` as
  planned, built now, scoped to exactly what these two components need.
- `src/components/StatusBadge.tsx`, `src/components/Disclosure.tsx` (+ stories, tests) —
  reusable, product-agnostic pieces.
- `src/features/run/PolicyGateRow.tsx`, `src/features/run/PolicyGateList.tsx` (+ stories,
  tests).
- Commits: `9e43f56` (gates.ts/format.ts), `30761df` (StatusBadge/Disclosure), `c200b1c`
  (PolicyGateRow), `07b0abd` (a fix found during verification, see below), `709a4b4`
  (PolicyGateList).

**Steps, in order**
1. Read `AGENTS.md` and `docs/spec-review-screen.md` fresh, per the task, plus
   `src/lib/types.ts` and `src/fixtures/run-messy.ts` (the assigned primary fixture) before
   planning anything.
2. Checked `run-messy.ts` against the task's claim that it "has the widest range of gate
   results" — it doesn't: only `pass` and `unknown`, no `fail` or `waived` at all.
   `run-blocked.ts` actually has the wider range. Flagged this in the plan rather than
   silently building fewer stories than asked, and used `run-blocked`'s gates to cover what
   `run-messy` can't.
3. Wrote `gates.ts` and `format.ts` first, since both components need them.
   `resolveEvidence`/`explanationFor` came from re-reading the fixtures closely: "what broke
   it", the "not run" reason, and the evidence list turn out to be the same lookup — the
   `detail` of whichever timeline event a gate's `evidenceIds` point to. There is no separate
   field for any of the three anywhere in the data model.
4. Verified every lucide-react icon name I planned to use actually exists in the installed
   version (`node -e "require('lucide-react')"`) before writing `StatusBadge`, rather than
   guessing and finding out at typecheck time.
5. Built `Disclosure` on native `<details>`/`<summary>` rather than custom JS. Confirmed, not
   assumed, that jsdom does not implement native keyboard activation for `<summary>`: a
   dispatched `keydown` does nothing, only `.click()` toggles it. Wrote the keyboard test
   around what jsdom can actually verify (reachable by Tab) and left a comment saying
   explicitly what it can't (Enter/Space activation, which every real browser does via
   `<summary>`'s implicit button role) rather than asserting something that would be a false
   negative.
6. Built `PolicyGateRow`, then `PolicyGateList`, running `tsc -b` and `eslint` after each file
   rather than saving verification for the end.
7. Built a static Storybook bundle and served it locally, then used the environment's global
   `playwright` CLI (not a project dependency — checked `which playwright` first, found it
   pre-installed) to screenshot the `AllResults` and `Exception` stories in both light and
   dark and actually looked at them, rather than trusting that a successful build meant
   correct rendering.
8. That screenshot caught a real bug: `formatDateTime` rendered "03:40 PM", 12-hour with
   locale-default AM/PM, against the spec's own 24-hour example ("14:32 today"). Fixed with
   `hour12: false`, added a test pinning it, rebuilt, re-screenshotted, confirmed "15:40".

**Why it was done this way**
- Checking `run-messy`'s actual gate variety against the task's description before building
  anything is the same instinct as checking a spec against reality generally: a claim about
  the data is itself a claim that needs a source, the same as anything that ends up on
  screen.
- The Disclosure keyboard test is deliberately honest about a tooling limitation instead of
  either skipping keyboard coverage entirely or writing an assertion that happens to pass for
  the wrong reason. A test that can't prove what it claims to prove is worse than no test,
  because it looks like coverage that isn't there.
- Screenshotting mattered more than usual here: the 24-hour bug was invisible to `tsc`,
  `eslint`, and every unit test, because none of them rendered the actual formatted string
  next to the spec's own example — they only checked internal logic in isolation. Reading
  the code again would not have caught it either; the code was doing exactly what it said,
  in a locale that happened not to be UTC/24-hour-default in this environment.

**How to do this by hand**
Read the fixture(s) a task names before trusting a claim about what they contain. When a
component needs to derive text that isn't a distinct field in the data model (a "reason", an
"explanation"), look for how the *existing* fixtures actually encode that information before
inventing a new field — in this codebase that meant re-reading `run-blocked.ts` and
`run-messy.ts`'s timeline `detail` strings. For any component built on a native HTML element
with implicit behaviour (here, `<details>`/`<summary>`'s keyboard activation), check what the
test environment actually simulates before writing the test, the same way you'd check a
browser's real behaviour — `jsdom`'s DOM implementation is not the same thing as a browser's
default-action handling. After a Storybook build succeeds, actually render at least one story
of anything with computed/formatted text and look at it — a passing build only proves the
code ran, not that what it produced is correct.

**Verification**
`npm run check` green after every commit (68 tests by the end, up from 27). `npx storybook
build` succeeded and was actually rendered: a static build served locally, screenshotted with
the environment's pre-installed global Playwright (no new project dependency) in both themes,
which is what surfaced the 24-hour clock bug — not the build succeeding, not `tsc`, not a
unit test. Contrast was not recomputed from scratch: every text usage in these components
uses `text-text-primary`/`text-text-secondary` (already verified in the design-system
session), and every status colour is used only as an icon or a border, never as text, per
`docs/DECISIONS.md` 0006 — so no new colour/text pairing was introduced that the earlier
computation doesn't already cover.

**Open questions / next**
- No automated accessibility check runs yet (`@storybook/addon-a11y`'s `test: 'error'` only
  takes effect through Storybook's own test runner or interactive mode, neither of which is
  wired into `npm run check`). Verification here was a real screenshot plus the structural
  guarantee that status colour never touches text — worth an actual `axe`-driven check once
  more components exist to justify the tooling.
- `PolicyGateList`/`PolicyGateRow` are presentational only, as asked — nothing composes them
  into a page yet, and there is no `RunReviewPage.tsx` to give the region its `<h2>Policy
  checks</h2>` heading. Next per `AGENTS.md`: plan that composition, or the next region
  (Timeline, which can reuse `Disclosure`).


### 2026-09-19 · Design system foundation: fonts, full colour palette, usage rules

**Goal**
Replace the scaffold session's placeholder colour tokens with the real palette (exact hex
values given, both themes), add the two typefaces, encode the three brand/status usage rules,
document all of it in Storybook, and verify contrast before finishing. No components.

**What changed**
- `src/styles/tokens.css` — full replacement of the primitive and semantic colour layers,
  plus `--font-heading` / `--font-body`. `--radius-*` and `--motion-*` untouched.
- `index.html` and `.storybook/preview-head.html` — Google Fonts, requesting exactly the
  weights used (Raleway 500/600/700, Montserrat 400/500).
- `src/styles/index.css` — shadcn bridge updated for the new token names; `accent`/
  `accent-foreground` dropped from it entirely (see below).
- `src/styles/README.md` — the three usage rules, plus the contrast numbers and what they
  mean for how status/accent colours can be used.
- `src/styles/tokens.stories.tsx` — rewritten: full palette, a typography specimen, the
  spacing scale, and the usage rules, in both themes.
- `docs/DECISIONS.md` — four new entries (0007 down to 0005) for the judgment calls below.
- `src/lib/types.ts` — one unrelated Prettier reformat (a union type's line wrap) picked up
  by `prettier --write .` before committing; not otherwise touched.

**Steps, in order**
1. Computed the actual WCAG contrast ratio for every realistic pairing before writing
   anything — a small Node script (`docs/DECISIONS.md`, 0005), not left as scratch work
   claimed but not shown. This is what the rest of the session's colour decisions are built on.
2. Rewrote `tokens.css`: a 14-step neutral ramp (the exact greys given, several reused between
   themes on purpose — e.g. light `bg` and dark `text-primary` are the same hex), then brand
   and status primitives, then the semantic layer.
3. `index.html`: added the Google Fonts `<link>`, requesting only the weights specified.
4. `npx vite build`, then a throwaway probe component (`bg-primary`, `text-status-fail`,
   `font-heading`, etc.), to confirm every new utility actually resolves to its token rather
   than trusting the source. Deleted the probe immediately after.
5. Rewrote the shadcn bridge in `index.css`. Two decisions here, both logged: `accent`/
   `accent-foreground` dropped rather than repointed (0007), and `destructive-foreground`
   reuses `--color-primary-foreground` rather than a duplicate pair, since the fail colour
   needs the identical white-in-light/near-black-in-dark flip (checked, not assumed).
6. Wrote the usage rules and contrast findings into `src/styles/README.md`, then
   `docs/DECISIONS.md` for the two that are real trade-offs rather than just findings: status/
   accent colours are icon-and-border only, never literal text colour (0006) — several fail
   4.5:1 as text in light theme otherwise — and the contrast-by-computation method itself
   (0005), since it caught a real bug (see below).
7. Rewrote `tokens.stories.tsx`. Built the status swatches to match the usage rule as-built
   (icon + border in the status colour, label in `text-primary`) rather than just describing
   the rule in prose next to a swatch that violates it.
8. `npx storybook build` to a scratch directory; grepped the output for the new token values
   and confirmed the story registered. Fonts were missing from the built iframe on the first
   pass — Storybook's preview iframe is a separate document from `index.html`, so the app's
   `<link>` tags never reach it. Added `.storybook/preview-head.html` with the same tags,
   rebuilt, confirmed both font families now appear in the built `iframe.html`.
9. `npm run check`, then `npx prettier --check .` — flagged one unrelated file
   (`src/lib/types.ts`, a union type Prettier now wants unwrapped); `--write` on it since it
   was a no-content, mechanical fix, not something to leave failing `format:check`.

**Why it was done this way**
- The contrast numbers are what actually drove the design decisions, not the other way
  around: the usage rule that status/accent colours are icon-and-border-only exists *because*
  several of them measured under 4.5:1 as text, not as a rule decided first and checked after.
- The reference mockup already showed this resolved (status labels in the ordinary text
  colour, not the status colour) — the rule was implicit in the source material; writing it
  down in `DECISIONS.md` makes it a rule a future component can be checked against, not just
  a pattern to notice by looking at a picture.
- Dropping the shadcn `accent` bridge slot rather than quietly repointing it to a neutral
  surface: repointing it would make `bg-accent` resolve to *something* without anyone having
  decided that was right for the specific component using it — the same failure mode
  `AGENTS.md` already warns against for one-off values, just hidden behind an existing name.

**How to do this by hand**
Compute contrast with the standard WCAG formula (linearize each sRGB channel, luminance-
weighted sum, `(L_lighter + 0.05) / (L_darker + 0.05)`) for every text/background pairing that
will actually occur, not a full cross-product of every token against every other — check
`--color-bg` against text tokens, `--color-surface-raised` against text tokens, each status
colour against the neutral surfaces it will sit on, and a candidate foreground against any
brand colour meant to be used as a filled background. Where a value fails, decide whether the
right fix is a different value, a restriction on how it's used (this session's choice for
status/accent), or an accepted exception (disabled text, borders) — and write down which, and
why, rather than silently picking one.

**Verification**
`npm run check` green. `npx vite build` + a throwaway probe component confirmed every new
Tailwind utility resolves to its token (deleted after). `npx storybook build` confirmed the
rewritten tokens story registers and both fonts load in the built preview. Contrast: every
pairing computed exactly (not estimated) via the WCAG formula; results and the resulting
usage rule are in `src/styles/README.md`, "Contrast".

**Open questions / next**
- No component yet actually uses a status chip or an accent pill — the tokens story is the
  first real check that the icon-only-colour rule is buildable, not a component enforcing it.
  Worth a lint rule or a shared component (once one exists) rather than relying on review.
- `src/lib/format.ts` (still not built — see the previous entry) is where `RunStatus`/
  `GateResult` values will eventually need the exact labels from Content rules; nothing in
  this session's token work required it yet.


### 2026-09-19 · Data layer: src/lib/types.ts, the three fixtures, src/lib/api.ts

**Goal**
Implement the data model from `docs/spec-review-screen.md` as `src/lib/types.ts`, build the
three fixtures it calls for, and add `src/lib/api.ts` as the seam in front of them. No UI.

**What changed**
- `src/lib/types.ts` — `RunStatus`, `GateResult`, `PolicyGate`, `TimelineEvent`,
  `ConfidenceArea`, `Decision`, `Run` from the spec's Data model, plus `DecisionInput` (not in
  the spec, needed for `submitDecision`). Doc comments tie each `RunStatus`/`GateResult` value
  to its exact Content rules label.
- `docs/DECISIONS.md` — two new entries (0003, 0004) for the two places this work departed
  from copying the spec's interfaces literally.
- `src/fixtures/run-messy.ts`, `run-blocked.ts`, `run-clean.ts` (+ a test file each) and
  `src/fixtures/index.ts` (the `runs` barrel).
- `src/lib/api.ts` (+ test) — `getRun`, `submitDecision`, and four error classes.
- Commits: `8883d8d` (types), `a7991ea` (run-messy), `0b79baa` (run-blocked), `9a94cb2`
  (run-clean + barrel + a wording fix that landed across all three fixtures), `e99e204` (api).

**Steps, in order**
1. Read `docs/spec-review-screen.md` in full before writing anything, including the sections
   Berit had added since the last session (Scenarios, Content rules, Hierarchy, Acceptance
   criteria) — the task asked to align with Content rules specifically, so I needed the
   current file, not the one from the scaffold session.
2. Wrote `types.ts`. Two places the literal Data model section wasn't enough on its own:
   `submitDecision`'s input shape (not defined anywhere in the spec), and the undo window
   (described in three other sections of the same document, with no field for it anywhere).
   Wrote both up as `docs/DECISIONS.md` entries rather than silently extending the interface
   or silently ignoring the gap.
3. Built the fixtures in the requested order (messy, blocked, clean), each as one
   self-contained file — no shared gate-catalog module, since `fixtures/README.md` frames each
   one as a standalone example a reader might open on its own.
4. For each fixture, wrote a small test asserting every `evidenceIds` value resolves to a real
   timeline event id. Nothing else in the toolchain would catch a typo'd id, and the whole
   point of the evidence field is that it is trustworthy.
5. Caught two inconsistencies by re-reading my own fixtures against the rules I'd just applied,
   before running out the clock on the task: `run-clean`'s summary said "Two files changed"
   against three actual `file_change` events (fixed to three, then to "3" — see next point);
   and separately, realized "Two files changed" itself was copying Region 2's illustrative
   sentence rather than following Content rules' own explicit later instruction — "'3 files
   changed', not '3'" — which says digits, not words. Fixed all three fixtures' file/test-count
   sentences to digits in the same pass (`9a94cb2`), leaving "One check failed: `<name>`"-style
   sentences as word-form since those directly mirror Region 2's own phrasing rather than being
   a bare count.
6. Wrote `src/lib/api.ts` matching the sketch already in `lib/README.md` almost exactly
   (including its exact class name, `NotFoundError`, rather than one I'd have picked myself),
   plus what this task additionally asked for: `NetworkError`, `DecisionConflictError`,
   `ValidationError`, and the `delayMs`/`simulateNetworkError`/`simulateConflict` options.
7. Wrote `api.test.ts`. Found a real bug in the test design, not the code, while writing it: a
   test asserting "approving needs no written reason" would have been the only test in the file
   to leave `run-clean` with a recorded decision, which would have made two *other* tests
   (expecting `ValidationError` for a missing reason) get `DecisionConflictError` instead if
   vitest ever ran them in a different order than written. Deleted that test — the same
   assertion is already covered by the "records who and when" test on `run-blocked`, which
   never needed a reason in the first place — rather than leave a passing-but-order-dependent
   test in the suite.
8. `npm run check` after every file; `npx prettier --write` on each new/changed file before the
   final check in that step.

**Why it was done this way**
- Two deviations from the literal spec (`DecisionInput`, and no field for the undo window) are
  both logged in `DECISIONS.md` rather than either bolted on silently or left unresolved. This
  is exactly the situation `AGENTS.md`'s "If something in this file turns out to be wrong or
  unhelpful, say so and propose a change" line is for, just applied to the spec document
  instead of `AGENTS.md` itself — the right move for a genuine gap is to name it, not route
  around it.
- The Content rules "digit, not word" fix is a small thing that would have been easy to miss
  entirely (Region 2's own worked example uses the word form, and I had been treating it as the
  canonical phrasing to reuse). It only surfaced because a test's assertion depended on an exact
  digit substring match — a case where writing the test first, not after, caught a content bug
  the checklist-reading pass alone had missed.
- `run-messy`'s `acknowledgedGateIds` is empty despite approving a production release over two
  unresolved checks. This is not an oversight — Content rules' sign-off rule is written to
  cover only failed and waived gates — but it reads like a gap in the spec itself, and I did
  not feel it was mine to close by inventing an unknown-gate acknowledgment rule that isn't
  written down anywhere. Flagged in the run-messy commit message and again here.

**How to do this by hand**
Read the spec's Data model section and transcribe each interface as-is first; only then read
the rest of the document (Scenarios, Content rules, Hierarchy, Acceptance criteria) looking
specifically for anything the Data model section doesn't have a place for — an undo window, a
sign-off tick, a specific display label — and decide, for each one, whether it is a type-level
gap (needs a field or a whole new interface) or a display-level concern (belongs in a comment
or in `format.ts` later, not in the type itself). Build the fixtures in whatever order gives
the most awkward one first; writing the boring one (`run-clean`) first tends to hide exactly
the layout and content problems the awkward ones are supposed to expose. For each fixture,
manually walk every `evidenceIds` array against the `timeline` array and check that each id
resolves — this is exactly what the per-fixture tests now do automatically.

**Verification**
`npm run check` green after every one of the five commits (27 tests passing by the end, up
from 5). Each fixture has a test asserting internal consistency (evidence ids resolve, a
waiver names who and why, the one error is followed by its retry, gate results are what the
fixture claims). `api.test.ts` covers: not-found for an unknown id; a controllable delay via
fake timers, so the "slow response" path is proven without an actual multi-second test;
`getRun` returning a copy rather than a live reference; a successful decision persisting
across a subsequent `getRun`; a simulated network failure; a real conflict (via `run-messy`,
with no flag needed) and a simulated one (via `run-clean`); and the written-reason requirement
for `changes_requested` and `rejected` but not `approved`.

**Open questions / next**
- Whether `run-messy`'s empty `acknowledgedGateIds` (approving into production over two
  `unknown` gates with nothing to tick) should stay that way, or whether the sign-off rule in
  Content rules should be widened to cover `unknown` gates too — this is Berit's call, not
  mine to make unilaterally.
- `src/lib/format.ts` is documented in `lib/README.md` but still does not exist. The
  `RunStatus`/`GateResult` display labels this task added as doc comments in `types.ts` are
  the natural seed for it, once UI work actually needs them turned into runtime strings.
- No component, fixture consumer, or screen exists yet. Next task per `AGENTS.md`: plan the
  first piece of `src/features/run/` against this data layer.



**Goal**
Turn the empty repository plus its instructions and spec into a runnable toolchain: Vite,
React 19, TypeScript strict, Tailwind with tokens, shadcn/ui (init only), lucide-react,
Vitest + React Testing Library, Storybook, ESLint + Prettier, an `npm run check` script, and
the dependency-direction rule from `AGENTS.md` enforced as a lint rule rather than left as a
convention to remember. No screen was built; `src/app/App.tsx` is a placeholder shell.

**What changed**
- `package.json`, `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json` +
  `tsconfig.storybook.json`, `vite.config.ts`, `vitest.setup.ts`, `index.html` — the toolchain.
- `src/main.tsx`, `src/app/App.tsx` (+ `App.test.tsx`) — the smallest real shell the toolchain
  could typecheck, lint and test against.
- `src/styles/tokens.css` — primitives and semantic tokens in two layers, light default, dark
  via `prefers-color-scheme` or `data-theme`, motion tokens respecting `prefers-reduced-motion`.
- `src/styles/index.css` — Tailwind entry, plus a bridge mapping shadcn's fixed names
  (`background`, `card`, `muted-foreground`, `border`, `ring`, …) onto the semantic tokens, so
  there is one palette rather than two.
- `components.json`, `src/lib/utils.ts` (+ test) — shadcn/ui wiring by hand (see below).
- `eslint.config.js`, `.prettierrc.json`, `.prettierignore` — lint and format, with
  `import/no-restricted-paths` encoding `fixtures → lib → components → features → app`.
- `.storybook/main.ts`, `.storybook/preview.tsx`, `src/styles/tokens.stories.tsx` — Storybook,
  trimmed down from what its installer proposed (see below), plus a live tokens story.
- `README.md` — what this project is, how to run it, links to `STORY.md`,
  `docs/spec-review-screen.md` and `AGENTS.md`.
- Commits: `c96152b` (Vite/React/TS/Tailwind), `2964082` (shadcn/lucide wiring),
  `5fe9348` (ESLint/Prettier/check), `22deae7` (Storybook).

**Steps, in order**
1. `npm create vite@latest viteseed -- --template react-ts` in the scratchpad, to see the
   current template's defaults before committing to any of them by hand.
2. Wrote `package.json` and the three tsconfigs by hand rather than copying the template,
   setting `"strict": true` explicitly — the current Vite template does not set it, and
   `AGENTS.md` requires it.
3. Wrote `vite.config.ts` (with `@tailwindcss/vite` and the `@` alias), `vitest.setup.ts`
   (`@testing-library/jest-dom` + `cleanup()`), `index.html`, `src/main.tsx`,
   `src/app/App.tsx`, `src/app/App.test.tsx`.
4. `npm install react react-dom lucide-react`, then
   `npm install -D vite @vitejs/plugin-react typescript @types/node @types/react
   @types/react-dom tailwindcss @tailwindcss/vite`, then
   `npm install -D vitest jsdom @testing-library/react @testing-library/dom
   @testing-library/jest-dom @testing-library/user-event`.
5. `npm run typecheck` failed: TypeScript 7 removed `baseUrl` (`paths` now resolves relative
   to the tsconfig itself) — removed it from `tsconfig.app.json`.
6. Wrote `src/styles/tokens.css` and `src/styles/index.css`, `npm run build`, then grepped the
   built CSS for `color-status-pass-fg` and the dark-mode media query to confirm the tokens
   actually reached the output rather than trusting the source alone.
7. `npx shadcn@latest init` failed: `ui.shadcn.com` is blocked by this session's egress
   policy (403 on CONNECT, confirmed via the proxy status endpoint). Did the equivalent by
   hand: `npm install -D class-variance-authority clsx tailwind-merge tw-animate-css`, moved
   the three that ship in component code from `devDependencies` to `dependencies`, wrote
   `components.json` and `src/lib/utils.ts` (`cn()`) plus a unit test for it, and added the
   shadcn-name bridge to `src/styles/index.css`. Renamed our accent token to `--color-action`
   first — shadcn's "accent" means a quiet hover surface, ours meant brand blue, and one name
   cannot mean both. Verified the bridge with a throwaway probe component using
   `bg-background`, `text-muted-foreground`, etc., grepped the built CSS to confirm each
   resolved to our token, then deleted the probe. Left a note in `index.css` that the mapping
   is unverified against a real shadcn-generated component, since none could be added.
8. `npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks
   eslint-plugin-react-refresh eslint-plugin-import eslint-import-resolver-typescript
   prettier eslint-config-prettier globals` failed on peer conflicts twice: `typescript-eslint`
   does not yet support TypeScript 7 (peer range `>=4.8.4 <6.1.0`), and `eslint-plugin-import`
   does not yet support ESLint 10. Pinned `typescript@~5.9.0` and `eslint@^9` and reinstalled.
9. Wrote `eslint.config.js`: typescript-eslint's `recommendedTypeChecked`, react-hooks,
   react-refresh, `eslint-plugin-import`'s recommended config, and
   `import/no-restricted-paths` with one zone per rule in `AGENTS.md`'s dependency direction.
   Worked through three real errors along the way: `eslint.config.js` itself needed
   `disableTypeChecked` (it is plain JS with no tsconfig of its own); the `import/resolver`
   settings had to live in a global block, not one scoped to `**/*.{ts,tsx}`, because
   `import/no-unresolved` from the recommended config applies to every file including that
   same `eslint.config.js`; and the multiple-tsconfig performance warning needed
   `noWarnOnMultipleProjects: true` on the resolver, not a typescript-eslint option.
10. Proved the dependency-direction rule actually fires, rather than trusting the config:
    added a throwaway `src/lib/_violation-check.ts` importing from `src/components/`, ran
    `npx eslint` on it, watched `import/no-restricted-paths` catch it with the exact message
    from `AGENTS.md`, then deleted both temporary files immediately.
11. `.prettierrc.json`, `.prettierignore`, `npx prettier --check .` — flagged
    `docs/spec-review-screen.md` and `src/features/run/README.md` from the earlier commit.
    Diffed what `--write` would do to them (quote style, and reflowing the TypeScript inside
    their code fences) and confirmed it would break "byte for byte, do not reformat" from that
    commit, so added every hand-authored spec/instruction file to `.prettierignore` by name
    instead of running Prettier over them.
12. Added `typecheck`, `lint`, `lint:fix`, `format`, `format:check`, `check` scripts;
    `npm run check` green.
13. `npx storybook@latest init --type react --builder vite` — it also proposed
    `@chromatic-com/storybook`, `@storybook/addon-mcp`, and `@storybook/addon-vitest` (which
    pulled in Playwright, `@vitest/browser-playwright`, `@vitest/coverage-v8`, and rewrote
    `vite.config.ts` into a projects workspace). None of that was asked for, and the vitest
    addon duplicates work `AGENTS.md` reserves for a separate Playwright end-to-end setup.
    `npm uninstall` the four packages plus `playwright`, restored `vite.config.ts` and
    `eslint.config.js` to hand-written form, deleted the canned demo stories in `src/stories/`.
14. `.storybook/main.ts` down to `addon-a11y` and `addon-docs`; set `a11y.test = 'error'` in
    `.storybook/preview.tsx` so a violation fails the story rather than only flagging it.
15. `.storybook/preview.tsx` and `.storybook/main.ts` needed a real tsconfig — the
    `allowDefaultProject` fallback used for `eslint.config.js` only covers plain JS, and these
    are typed against `@storybook/react-vite`. Added `tsconfig.storybook.json`, referenced it
    from the root `tsconfig.json`, and added it to the ESLint import resolver's project list.
16. Wrote `src/styles/tokens.stories.tsx`: not a component, a live rendering of the status and
    surface tokens, with a `theme` toolbar global and a decorator that sets
    `document.documentElement.dataset.theme`, so Light and Dark are two real story variants
    rather than a screenshot of the CSS.
17. `npm run check` and `npx storybook build` to a scratch directory; grepped the built CSS
    for `color-status-pass-fg` and the built `index.json` for the story's title to confirm the
    tokens and the story both actually landed, not just that the build exited zero.
18. Wrote the root `README.md`.

**Why it was done this way**
- TypeScript strict, ESLint's dependency-direction rule, and the shadcn/token bridge are all
  cases of turning a sentence in `AGENTS.md` into something a tool checks, rather than
  something to remember. That is the whole point of `import/no-restricted-paths`: a future
  session (agent or human) importing the wrong way gets a lint error naming the exact rule in
  `AGENTS.md`, not a silent architectural drift discovered months later.
- Every one of the version pins (TypeScript 5.9, ESLint 9) and the by-hand shadcn init came
  from a real, reproduced failure — not a guess at what might be safest. Each is logged above
  with what broke and what the fix was, so a future upgrade attempt has something concrete to
  retry against instead of rediscovering the same peer conflict.
- Storybook's installer proposing a hosted SaaS integration, an MCP addon, and a second test
  runner by default is worth knowing about, not just quietly working around: `AGENTS.md` says
  "ask before adding a dependency," and a generator adding six is the same decision made for
  you. Trimming it back to the three tools actually asked for was the judgment call; the
  removal is recorded here rather than left to be discovered later as an unexplained gap
  between what a fresh `storybook init` would produce and what this repo has.

**How to do this by hand**
Run `npm create vite@latest -- --template react-ts` for the shape of a Vite + React + TS
project, then rewrite `tsconfig.app.json` to add `"strict": true` and the `@/*` path alias.
Add Tailwind via `npm install tailwindcss @tailwindcss/vite`, add the plugin to
`vite.config.ts`, and write `tokens.css` as two layers (primitives as plain custom
properties, semantic tokens inside `@theme`) rather than reaching for arbitrary Tailwind
colors. For shadcn/ui without network access to its registry: install
`class-variance-authority`, `clsx`, `tailwind-merge` as real dependencies, write a `cn()`
helper, and write `components.json` by hand referencing the same file paths. For the
dependency-direction rule, read `eslint-plugin-import`'s `no-restricted-paths` docs and write
one `zones` entry per arrow in `AGENTS.md`'s "Dependencies point one way" sentence, then
prove each one by writing a small file that violates it and confirming the linter refuses it,
the same way tests prove code by trying to break it.

**Verification**
`npm run check` (typecheck + lint + test) green at every commit in this session.
`npm run build` and `npx storybook build` both succeed. Grepped built output (not just source)
to confirm design tokens and the dependency-direction rule are real: the built app CSS
contains the status tokens and the dark-theme media query; a deliberately-violating import was
caught by name and message; the Storybook build's CSS and `index.json` contain the tokens and
the new story respectively. `npx prettier --check .` and `npx eslint .` both clean.

**Open questions / next**
- `ui.shadcn.com` is blocked by this session's network policy, so the shadcn/ui → token bridge
  in `src/styles/index.css` has never been checked against an actual generated component —
  only against a throwaway probe using the same class names. Worth a real check (e.g. adding
  `button` or `badge`) the first time network access allows it, or by hand-porting one
  component's source from the shadcn docs.
- TypeScript is pinned to `~5.9.0` (not 7) because `typescript-eslint` doesn't support 7 yet;
  ESLint is pinned to `^9` (not 10) because `eslint-plugin-import` doesn't support 10 yet.
  Worth revisiting both pins once upstream catches up.
- `PROJECT-SETUP.md`, which this task's instructions said to delete, does not exist anywhere
  in the repository or its git history — nothing was deleted, since there was nothing to
  delete.
- No real component, fixture, or screen exists yet. Next task per `AGENTS.md`: plan the first
  piece of `src/features/run/` (or the fixtures it depends on) and get it accepted before
  building.

