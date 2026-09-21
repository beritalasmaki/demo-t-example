# Decisions

A record of choices where there was a real trade-off. Newest first.

Each entry has four parts: the situation, the options, the choice, and what it means going forward.

---

## 0019 · Smooth scroll for section nav: CSS `scroll-behavior`, not `scrollIntoView`

**Context.** AnchorNav's links (`#run-header-heading` etc.) jumped instantly. The ask was a
smooth scroll on click, reduced-motion respected, plus `scroll-margin-top` on each heading if
any sticky/fixed element would otherwise cover it after scrolling.

**Options.** (a) `scroll-behavior: smooth` on `html` via CSS, gated behind
`@media (prefers-reduced-motion: no-preference)`, relying on the browser's native anchor
navigation. (b) A click handler per link calling
`element.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })`.

**Choice.** (a). AnchorNav's links are plain `<a href="#id">` with no other click behaviour —
there is nothing for a handler to do that the browser doesn't already do given the CSS
property, and no other programmatic scroll exists anywhere in the app for the site-wide
`html` selector to affect unintentionally. The reduced-motion branch falls out of the media
query for free (the property is simply never set, so the browser's own instant jump runs,
not an animation that's merely shortened) rather than needing a JS `matchMedia` check.

**Consequence — no `scroll-margin-top` added.** The one *conditional* part of the ask
("if any nav/header element is sticky/fixed...") turned out not to apply: `AnchorNav` is
sticky, but it's a side rail next to the content column (`flex items-start` in
`RunReviewPage.tsx`), not a bar stacked above it — scrolling never tucks a region heading
underneath it. Verified in a real browser (Playwright): `getComputedStyle(html).scrollBehavior`
reads `smooth` under `no-preference` and `auto` under `reduce`, and a keyboard-activated
(Enter, not click) nav link scrolls the page either way. If a fixed header is ever added
above the content column, this is the entry to revisit.

---

## 0018 · Disclosure's open/close animation: CSS grid-rows, not a measured-height overshoot

**Context.** The request asked for a springy overshoot easing on open (`cubic-bezier(0.34,
1.56, 0.64, 1)`) with an explicit constraint: "no bounce/scale/rotation — the personality
comes from the easing curve, not from extra movement." Native `<details>` can't be animated
directly (the browser applies `display: none` to its children the instant `open` goes false,
before any transition can run), so this needed a real technique, not just adding
`transition`.

**Options.** (a) A single-track CSS Grid (`grid-template-rows: 0fr` ↔ `1fr`), transitioning
that property with the spring easing — no JS state, `<details>` stays exactly as
uncontrolled as it already was. (b) Measure the content's real pixel height (a ref +
`scrollHeight`, or a `ResizeObserver`) and animate an explicit `height` (or `max-height`) to
that value in React state — more moving parts, and a component whose own doc comment
currently says "native `<details>`/`<summary>` rather than custom JS."

**Choice.** (a) — implemented and verified: the computed `transition-duration` and
`transition-timing-function` on open genuinely match the spring token, and the row's real
height interpolates through it (confirmed via `getComputedStyle` mid-transition in a real
browser, not assumed from the CSS alone). **But it doesn't produce a literally visible
overshoot.** A CSS Grid track sized in `fr` units has nothing to overshoot *into*: with only
one flexible track, the row always claims exactly the space the content needs, at every
point in the curve, including the portion of the curve past `1.0` — there's no pixel value
for the row to briefly exceed and settle back from, the way a `scale` or a fixed-pixel
`height` animation could. (b) would have made a genuine overshoot possible (an explicit pixel
height briefly exceeding the content's natural height *is* visible, as a small extra gap that
closes), but only by giving up the "no custom JS" property this component has had since it
was built, for a request that also explicitly ruled out the other way overshoot is usually
made visible (`scale`). Given the explicit "no scale" constraint, (a) is what's implementable
within it — the curve genuinely runs at the exact tokens specified, it just expresses as an
unusually fast-then-settling *rate* of opening rather than a visible bounce past the final
size.

**Consequence.** `--motion-duration-open`/`-close`/`--motion-ease-spring`/`--motion-ease-in`
are real, used tokens, and the transition timing is verified correct. If a literally visible
overshoot bounce turns out to matter more than keeping `Disclosure` free of JS state and
`transform`/`scale`, option (b) is the concrete alternative — a small, contained change
(a ref, a measured height, React `open` state synced from the native `toggle` event) — not a
redesign.

---

## 0017 · Undo is real, but local-only — there is nothing to reverse it on

**Context.** The undo window (0003) was, until now, a countdown with nothing to click: real
information ("you can undo this for 6 min 59 s more"), but no way to act on it. The request
was to add an actual "Undo" button. `lib/api.ts` has no `undoDecision`-shaped function, and
adding one would mean deciding what a real undo endpoint does — whether it needs its own
audit trail entry, whether a second reviewer can undo someone else's decision, what happens
if the undo itself races a release — none of which this demo's fixture-backed `getRun`/
`submitDecision` pair has any real backend semantics for.

**Options.** (a) A real `<button>` that calls `onRunUpdated({ ...run, decision: undefined,
status: 'awaiting_review' })` — the exact same local-state mechanism `DecisionBar` already
uses for a live decision or an S5 conflict (`RunReviewPage`'s `decidedRun` state), reverting
what's on screen, with no network call. (b) Add a matching `undoDecision` to `lib/api.ts`,
mirroring `submitDecision`'s shape, so undo goes through the same seam a real backend would.
(c) Leave the button out and keep only the countdown text.

**Choice.** (a). It makes the button real in the only sense this app can make anything
real — the screen genuinely changes, immediately, the same way approving or rejecting does —
without inventing backend behaviour (b) would need real answers for for a demo that
explicitly has none (AGENTS.md, Stack: "No backend"). (c) would leave the request half-done
for no reason: the local-state mechanism (a) uses already exists and already does exactly
this shape of thing.

**Consequence.** Undo is real and immediate on screen, but only for this browser tab, this
session, this local React state — refreshing the page reloads the original fixture,
undecided-or-decided exactly as it was written, same as any other local-only change already
made through `DecisionBar`. If a real backend is ever added, this is the seam
(`onRunUpdated`) where an actual `undoDecision` call would slot in, the same way (b) would
have worked, without changing `DecisionBar`'s own shape.

---

## 0016 · Person-vs-system actor icons are a string heuristic, not a data-model field

**Context.** A screenshot review asked for a small icon distinguishing a person's name from a
system's name-and-version next to `PolicyGate.evaluatedBy`, `PolicyGate.waiver.by` and
`Decision.by` (docs/spec-review-screen.md, Content rules, "Who did what": "a person by name,
or a system by name and version"). The data model has no field saying which one a given
string is — adding one was explicitly out of scope for this task.

**Options.** (a) A heuristic over the string itself: every system name in this app's fixtures
ends in a version tag ("policy-engine v2.3"), no person's name does. (b) Add a real
`PolicyGate.evaluatedByKind: 'person' | 'system'` (and the equivalent for `waiver`/
`Decision`) field to the data model. (c) Skip the icon distinction entirely until a real field
exists.

**Choice.** (a), `src/lib/actors.ts`'s `isSystemActor`. Verified against every actual
`evaluatedBy`/`waiver.by`/`decision.by` value across all three fixtures (7 distinct values: 4
system, 3 person) — correct on all of them. (b) is the more correct long-term answer but was
out of scope tonight; (c) would have left the request half-done for no real reason, since (a)
is cheap, reversible, and doesn't touch anything (b) would later need to replace.

**Consequence.** This is a text-pattern guess, not a real distinction: a future system name
that doesn't end in a version tag, or a person whose name coincidentally does, would be
misclassified. It is verified correct on every value that exists today, not proven correct in
general. If a system evaluator is ever named without a version suffix (or a gate/decision
gains a real `evaluatedByKind`-style field for another reason), `isSystemActor` should be
replaced, not extended with more pattern cases.

---

## 0015 · `format.ts`'s locale is now pinned, and checked, not left to the runtime default

**Context.** Relative-time strings (`formatRelativeTime`) rendered in Finnish
("7 kuukautta sitten") instead of English, on a machine whose browser/OS reported that
locale. Every `Intl`/`toLocale*` call in `src/lib/format.ts` passed `undefined` for locale,
which means "follow the runtime's default" — not a deliberate choice, just left unset. This
is the second time a bug in this exact file has come from the same root cause: the first was
12-hour vs. 24-hour clock time (`docs/WORKLOG.md`, 2026-09-19), fixed with `hour12: false`
but without addressing the *other* locale-dependent calls in the same file, which is exactly
why this one was still open to find.

**Options.** (a) Pin every locale-sensitive call in `format.ts` to a single explicit
constant (`'en'`), and rely on code review to keep it that way. (b) Same fix, plus a narrow
automated check (matching `scripts/check-theme-bridge.mjs`'s precedent, 0009) that fails
`npm run check` if any locale-sensitive call in that file omits an explicit locale again.
(c) Leave it locale-dependent, and instead force a consistent locale at the app's root (e.g.
an `<html lang>`-driven i18n setup).

**Choice.** (b), `scripts/check-format-locale.mjs`. (a) alone is what was already true for the
12-hour-clock fix — it held for exactly the one call that got fixed, not the others in the
same file, which is how this happened a second time. (c) is real internationalization
infrastructure this app doesn't have and doesn't need yet (it has no other language content;
Content rules' wording is fixed English throughout) — pinning one file's own calls is a much
smaller, sufficient fix for the actual problem. Verified the same way 0009's check was:
reintroduced the exact bug, confirmed the new check fails and names the offending call, then
confirmed a clean pass after restoring.

**Consequence.** `format.ts` can no longer regress to the runtime's default locale without
`npm run check` failing immediately and naming the exact call. The check is deliberately
narrow — a regex over one file's known call shapes — and would need updating if a
locale-sensitive call were added elsewhere in the app or written in an unrecognized shape.

---

## 0014 · `--color-primary`/`--color-primary-foreground` were a self-reference cycle, not a safe mirror — correcting 0008

**Context.** 0008 audited every bridge name against tokens.css and found one other exact-name
overlap besides border: `primary`. It reasoned that was fine because "the bridge maps it to
itself, which is only safe because both sides already agree on the value" — i.e.
`--color-primary: var(--color-primary);` in the bridge, mirroring tokens.css's own
`--color-primary: var(--violet-light);`. That reasoning was wrong, and 0008's own text above
is left as it was written rather than edited to hide the mistake. Building the first real
shadcn components (0013) and actually looking at the rendered result — not just the source —
showed `bg-primary` painting nothing at all in light theme. Tailwind merges an `@theme` name
and a same-named `@theme inline` name into one registry entry, the later (bridge) declaration
winning outright, never layered on top of the earlier one. So the bridge's line wasn't
"mirroring" anything at runtime — it was the *only* surviving declaration for that name, and
it referenced its own name: a CSS custom-property cycle, which computes to nothing (per spec,
its guaranteed-invalid value), silently. `--color-primary-foreground` had the identical bug.
Worse, tokens.css's own `--color-focus-ring: var(--color-primary);` rode the same cycle,
making `:focus-visible`'s outline colour invalid too — every keyboard focus ring on the site
was invisible in light theme, the default theme, until this was found and fixed.

**Options.** (a) Remove both self-referencing lines from the bridge, same fix as 0007/0008 —
tokens.css's own declaration becomes the only registry entry for the name, nothing to collide
with. (b) Keep the bridge lines but give them a real, different value pointing somewhere
else. (c) Rename tokens.css's `primary`/`primary-foreground` to dodge shadcn's vocabulary
entirely.

**Choice.** (a). There is no version of redeclaring a colliding name in the bridge that is
safe — not a different value (0007/0008's failure mode: silently wrong, not invalid) and not
the name's own value either (this failure mode: silently invalid). The only fix that can't
recreate either bug is to not redeclare the name at all. (c) is a bigger, more disruptive
change for a collision (a) already resolves cleanly, and rejected here for the same reason
0009 rejected it for border/accent.

**Consequence.** `bg-primary`/`text-primary`/`bg-primary-foreground`/`text-primary-foreground`
now resolve to tokens.css's real values in both themes, verified by a probe build and by
`getComputedStyle` on the rendered app. `:focus-visible` is visible again in light theme,
confirmed the same way, on a real focusable element, not just by reading the CSS. Every other
bridge name was re-audited against tokens.css for this exact pattern (a name that collides at
all, regardless of what value it's given); none of the remaining ones do.
`scripts/check-theme-bridge.mjs` (0009) is rewritten: its "safe if the value mirrors the
token's name" exception — exactly the reasoning 0008 used, and exactly what let this bug
through unflagged for as long as it did — is gone; any colliding name is now an error, full
stop. A second, independent check was added alongside it: build the real CSS and, in an
actual browser, verify every semantic colour's `bg-*`/`text-*` utility actually paints its
own colour, in light and both dark paths — the thing that would have caught this even if the
static rule had missed it, and that also caught a synthetic mutual cycle between two
non-colliding bridge names during verification (a case the static rule structurally cannot
see). This makes `npm run check` depend on a real Chromium build; see `README.md` for the
one-time `npx playwright install chromium` this now requires.

---

## 0013 · Added the shadcn bridge's missing `border-color` preflight reset

**Context.** Adding the first real shadcn components (Button, Checkbox, Dialog — fetched
directly from shadcn-ui/ui on GitHub, since ui.shadcn.com is blocked by this session's egress
policy) exposed a gap the bridge comment had flagged as unverified: Tailwind v4's preflight
sets bare `border`/`border-*` width utilities with `border-color: currentColor`, not any theme
token. Every fetched component uses bare `border` assuming shadcn's own classic
`* { @apply border-border }` reset, which this project never had — so `DialogContent`'s and
Button's `outline` variant's border would have rendered as `currentColor` (matching text)
instead of `--color-border`.

**Options.** (a) Add the missing global reset (`*, ::after, ::before { border-color:
var(--color-border); }`) to `index.css`'s existing `@layer base` block, matching shadcn's own
convention. (b) Patch only the three new files to use the explicit `border-border` utility
instead of bare `border`, leaving no site-wide change. (c) Leave it and accept the wrong
border colour until it's visibly noticed.

**Choice.** (a). This is exactly the kind of cross-cutting shadcn-compatibility concern the
bridge file exists to own, and the bridge comment already anticipated needing this fix once a
real component landed. Scoping the fix to only the three new files (b) would leave the same
gap for every future shadcn component to hit again.

**Consequence.** Any element anywhere in the app that uses a bare Tailwind `border` utility
now gets `--color-border` by default instead of `currentColor`. Verified with a probe build:
the compiled CSS shows the reset before any component styles, and `bg-surface-raised`/
`hover:text-foreground` are what the three new files reference instead of shadcn's
`accent`/`accent-foreground` (dropped from the bridge by 0007), per that decision's own
instruction to patch call sites by hand.

---

## 0012 · Passive detection of a conflicting decision is out of scope for v1

**Context.** Scenario S5 ("Run decided by another reviewer during review") describes two
different moments a conflict can be caught: passively, while a reviewer is just reading the
screen and someone else decides in the background; and actively, at the moment this reviewer
tries to submit their own decision and finds one is already recorded. `lib/api.ts` only
supports the second: `submitDecision` throws `DecisionConflictError` if `run.decision` is
already set. There is nothing to poll or subscribe to that would let `RunReviewPage` notice a
conflict while a reviewer is doing nothing but reading.

**Options.** (a) Build only the active form (`DecisionDialog`'s conflict state), leaving the
passive form for later. (b) Add polling to `useRun` (re-`getRun` on an interval, compare
`decision`) so a background change surfaces even without a submit attempt. (c) Add a fake
real-time channel (e.g. an event emitter in `lib/api.ts`) purely to simulate what a real
backend's websocket or long-poll would eventually do.

**Choice.** (a). (b) and (c) are both real, buildable features, but they're a distinct piece
of work — deciding how often to poll, whether to interrupt a reviewer mid-read, how to surface
a change that isn't a conflict yet (the run simply moved on) — and the task that motivated this
session asked specifically for the conflict `submitDecision` already simulates. Building the
passive form now, unasked, would be scope creep into a feature this app doesn't have the
believable backend semantics for yet (AGENTS.md: "ask before... restructuring").

**Consequence.** A reviewer who never clicks Approve/Request changes/Reject while someone else
decides in the background sees nothing change on their screen until they act — at which point
`DecisionDialog` catches it, exactly as the lighter form already does. The full S5 (a banner or
similar appearing unprompted while reading) is genuinely unbuilt, not just untested; it belongs
with whatever `useRun` needs when a real backend can push or be polled for changes.

---

## 0011 · `Run.revision` added to the data model

**Context.** The approve confirmation ("Release revision *x* to *y*") and the post-decision
view both need a real, sourced revision string. The spec's own data model only puts `revision`
on `Decision` — set once a decision exists, too late for a confirmation dialog that has to
show it *before* the reviewer decides anything. Non-negotiable 3 ("No claim without a source")
rules out putting an unsourced or made-up value in that dialog.

**Options.** (a) Add `revision: string` to `Run` itself. (b) Derive something revision-shaped
from existing fields (e.g. `Run.id`) instead of adding one. (c) Leave the confirmation text
without a concrete revision until a real backend supplies one.

**Choice.** (a). (b) would show something in the revision's place that isn't actually a
revision identifier — a different flavor of the same "invented" problem non-negotiable 3
warns against, just one level removed. (c) fails Scenario S6 and the Buttons content rule
outright, both of which give a concrete revision in their own example text. This mirrors
0004's precedent exactly: `DecisionInput` needed a field the spec's `Decision` didn't have, and
the fix there was the same — a small, deliberate, documented addition, not a workaround.

**Consequence.** Every fixture now carries a `revision`; `run-messy`'s matches its already-
recorded `decision.revision` exactly (`e91a4c`), since nothing has moved on since it was
approved. A future run that changes revision after a decision was already made — the deeper
form of staleness 0012 above scopes out — would need `Run.revision` and `Decision.revision` to
be allowed to differ; nothing here prevents that, but nothing depends on it either yet.

---

## 0010 · Run status and environment get a neutral `Tag`, not `StatusBadge`

**Context.** `RunHeader` needs to show `RunStatus` (running/blocked/awaiting_review/approved/
changes_requested/rejected) and the target environment (dev/staging/production), both with
"icon + text, never colour alone" (AGENTS.md non-negotiable 4). `StatusBadge` already does
exactly that shape of thing for `GateResult` — but its five tones are wired to
`--color-status-*`, and both `tokens.css` and `src/styles/README.md` scope those tokens
specifically to "a claim about a policy check." Neither a workflow phase nor a deployment
environment is that.

**Options.** (a) Reuse `StatusBadge`, mapping each `RunStatus`/environment value onto the
closest-feeling existing tone (e.g. `approved` → `success`, `rejected` → `danger`).
(b) Add new tones (and new `--color-status-*` tokens) for the values `StatusBadge` doesn't
already cover. (c) Build a colour-neutral `Tag` (icon + label, no tone) for anything that
needs "icon + text" but isn't a policy-check claim.

**Choice.** (c). (a) would visually conflate two different claims made by two different
parties — "this policy check passed" and "this run was approved" are not the same statement,
and `src/styles/README.md` already warns against exactly this kind of look-alike confusion for
accent vs. status. (b) solves the confusion but violates AGENTS.md's design-system target ("a
new screen can be built without adding a single new colour value") for a case that doesn't
need a new colour at all — a workflow phase doesn't need to look like a pass/fail claim to be
legible; an icon and an exact label are enough.

**Consequence.** `Tag` (`src/components/`) is now the generic building block for "icon + text,
no colour semantics" — reusable anywhere a status-shaped thing isn't actually a policy-check
result. `StatusBadge` stays scoped to `GateResult` exactly as before. If a future region needs
another non-policy status (e.g. something for `ConfidenceArea` or `Decision`), it should reach
for `Tag`, not extend `StatusBadge`'s tone set.

---

## 0009 · Shadcn-bridge/token collisions are now checked by a script, not by memory

**Context.** 0007 (`--color-accent`) and 0008 (`--color-border`) were the same bug found
twice, six commits apart: `src/styles/index.css`'s `@theme inline` block declared a custom
property under the exact name of one of our own semantic tokens, but pointed it at a
different value. Because the bridge is `@import`ed after `tokens.css`, that declaration wins
the cascade for every consumer of the name, everywhere in the app — not only inside shadcn
components. Both were only found because a component happened to be the first thing to use
that particular Tailwind class, and someone thought to run a probe build instead of trusting
the source. Nothing stopped a third name from doing the same thing silently, forever, until
something visibly broke.

**Options.** (a) Keep relying on probe builds and code review to catch this by eye, now
that it's a documented pattern to watch for. (b) Write an automated check for this specific
class of bug — any bridge declaration that shares a token's name is only valid if it mirrors
that token's value exactly — and run it as part of `npm run check`. (c) Avoid the possibility
entirely by renaming either the bridge's or the tokens' vocabulary so the two can never share
a name.

**Choice.** (b): `scripts/check-theme-bridge.mjs`. (a) is what already failed twice — a
pattern worth documenting is a pattern worth enforcing, not re-noticing. (c) would work but
means giving up shadcn's fixed naming convention (`border`, `accent`, `ring`, …) or renaming
our own tokens to dodge collisions that don't exist yet, which is a bigger, more disruptive
change for a problem a small script already solves. The script reads both `@theme` blocks as
text, matches declarations by name, and fails if a bridge value under a colliding name is
anything other than `var(--that-name)` — the one form that provably carries the token's value
through unchanged. Verified by temporarily reintroducing both the accent and the border bugs
and confirming it fails on each, then confirming it passes clean on the current files.

**Consequence.** A third collision like this now fails `npm run check` immediately, at the
name level, before anyone needs to notice a wrong colour or think to probe-build. The check
is deliberately narrow (a regex over two known blocks, not a real CSS parser) — it only knows
about this one failure mode, not shadcn-bridge correctness in general, and it would need
updating if the bridge or tokens file's structure changed shape enough to break the regex.
That's an acceptable trade for how cheaply it runs and how exactly it targets the two bugs
that already happened.

**Superseded in part by 0014.** The "only valid if it mirrors that token's value exactly"
rule above is exactly what missed the `primary`/`primary-foreground` self-reference cycle —
mirroring by name is not safe, only omitting the colliding name is. The script no longer has
that exception, and now also builds the real CSS and checks computed values in a browser,
which a text-level regex structurally cannot do. See 0014 for the full account.

---

## 0008 · Removed the shadcn bridge's `--color-border` override

**Context.** `src/styles/index.css`'s shadcn bridge redeclared `--color-border` to equal
`--color-border-subtle`, for shadcn's own fixed vocabulary. `--color-border` is also a real
semantic token in `tokens.css`, a stronger border colour than the subtle one — the same name
meaning two different things, the same collision already caught for `accent` (0007), just
missed for `border` because nothing had used `border-border`/`bg-border`/`text-border`
directly until building `ToggleChip` for the Timeline task. Verified with a probe build, not
assumed: `border-border` was silently resolving to the subtle value.

**Options.** (a) Leave it — nothing currently visible was wrong. (b) Rename our semantic
token to avoid the collision. (c) Remove the bridge's override, same as 0007 did for accent.

**Choice.** (c). Once removed, `--color-input` (which was already defined as
`var(--color-border)`) automatically resolves to our real token via the normal CSS cascade,
with no further change needed — a strictly better outcome than 0007's accent case, which is
left with no value in the bridge at all until a real component supplies one.

**Consequence.** `border-border`/`bg-border`/`text-border` now mean what `tokens.css` says
they mean, everywhere, including inside any future shadcn component. Audited the rest of
shadcn's bridge vocabulary the same way (probe-built and checked the resolved value, not
just read the source) rather than assume this was the only one: `primary` is the one other
exact-name overlap, and it isn't a collision — the bridge maps it to itself, which is only
safe because both sides already agree on the value. `secondary`, `muted`, `destructive`,
`ring` and `input` don't collide, because none of them is also one of our own token names.

**Correction (see 0014).** The claim above about `primary` being safe was wrong, and this
paragraph is left as originally written rather than edited to hide that. The bridge mapping
it "to itself" wasn't a safe mirror — it was a self-referencing CSS custom-property cycle
that silently computed to nothing in light theme, taking `--color-focus-ring` (and every
`:focus-visible` outline on the site) down with it. The probe-build audit this paragraph
describes checked whether the *value* looked right by reading the source; it didn't check
whether the property actually resolved to anything at runtime, which is the only way this
specific failure mode shows up. 0014 has the full account and the fix.

---

## 0007 · shadcn's `accent` bridge slot is dropped, not remapped

**Context.** shadcn/ui components are written against a fixed vocabulary, including
`accent`/`accent-foreground` for a quiet hover surface. The design system now has a real,
visible `--color-accent` (teal-green) — a genuine brand colour, not a hover tint. One CSS
custom property in the shadcn bridge (`src/styles/index.css`) cannot mean both.

**Options.** (a) Point shadcn's `accent` bridge slot at some neutral surface
(`--color-surface-raised`) so any generated component's hover state still resolves to
something, even though the name no longer means what shadcn intends.
(b) Drop the `accent`/`accent-foreground` mapping from the bridge entirely, and leave it
unmapped until a real component needs it.

**Choice.** (b). Silently repointing `accent` to a neutral surface would make `bg-accent`
resolve to *something* without anyone deciding it was right for that specific component — the
same failure mode as inventing a one-off value, just hidden behind an existing name.

**Consequence.** Any future shadcn component that references `bg-accent` or
`accent-foreground` will not theme itself automatically; whoever adds that component patches
it by hand to use `--color-surface-raised` (or whatever fits), the same way `ui.shadcn.com`
being blocked already means every shadcn integration in this repo is manual and unverified
until a first real component exists.

---

## 0006 · Status and accent colours are icon/border colour, never text colour

**Context.** The design system's colour spec gives one hex value per status and per brand
colour, per theme. Several of those, computed as literal text colour against the app's
surfaces, fail 4.5:1 in light theme: `--color-accent` (~3.1–3.3:1),
`--color-status-pass` (~4.0–4.3:1), `--color-status-not-applicable` on
`--color-surface-raised` specifically (4.43:1).

**Options.** (a) Darken the affected light-theme values until they clear 4.5:1 as text.
(b) Keep the given values exactly, and rule that these colours are only ever used for an icon,
a border or a swatch — never the literal colour of the label text next to them, which stays
`--color-text-primary` or `--color-text-secondary`.

**Choice.** (b). The given values are exact, and the reference mockup this task was built
from already shows label text in the ordinary text colour, not the status colour — the rule
was implicit in the source material, just not written down until now.

**Consequence.** Every status/accent-coloured icon or badge component built from here on
must keep its label in a text token, not the status colour, and this needs to be checked by
eye in review (nothing currently enforces it automatically). Icons and borders themselves are
fine at these values — they clear WCAG's 3:1 non-text threshold — so the values are not
wasted, only restricted in where they can carry text.

---

## 0005 · Contrast is verified by computing WCAG ratios, not by eye

**Context.** This task asked for every text/background pairing in the new colour spec to be
checked against 4.5:1 before finishing. Contrast is a real number, not a visual impression —
"looks readable" and "clears 4.5:1" diverge exactly at the borderline cases that matter most.

**Options.** (a) Judge each pairing visually against the rendered swatches.
(b) Compute the actual WCAG relative-luminance contrast ratio for every pairing.

**Choice.** (b), with a small script (not committed — it was scratch work, not part of the
app) implementing the standard formula: linearize each sRGB channel, take the luminance-
weighted sum, then `(L_lighter + 0.05) / (L_darker + 0.05)`.

**Consequence.** The numbers in `src/styles/README.md`, "Contrast" are exact, not estimated,
and they surfaced a real bug before it shipped: a filled primary button needs white text in
light theme but near-black in dark theme, because the dark-theme primary is a lightened
violet. A by-eye check on one theme alone would very plausibly have missed this.

---

## 0004 · `DecisionInput` carries `by`, not just what changed

**Context.** `submitDecision(runId, decision)` needs to know who is deciding. A real backend
would read that from an authenticated session, never from the request body, so the client
would not need to send it.

**Options.** (a) Add a third `reviewer` parameter to `submitDecision`. (b) Put `by` on
`DecisionInput` itself. (c) Wait until there is a real backend to decide this.

**Choice.** (b), because there is no session to read it from yet, and the task that asked for
this API specified an exact two-argument signature.

**Consequence.** `by` on `DecisionInput` is a stand-in for auth, not a design to keep: once a
real backend exists, it should read the reviewer from the session and this field should come
out. `at`, by contrast, is set by `lib/api.ts` itself, not taken from the input — a client
should not get to say when its own request happened.

---

## 0003 · The undo window is a policy, not a stored field

**Context.** The spec's data model has no field for the undo window it describes elsewhere
(Region 6, "Hierarchy and disclosure", "Acceptance criteria" all mention a counting-down undo
window after a decision), and `docs/spec-review-screen.md` gives one concrete number: "You can
undo this for 10 minutes."

**Options.** (a) Add `undoableUntil` (or similar) to `Decision`, set once at decision time.
(b) Treat the window as a fixed duration computed from `Decision.at`, not stored at all.

**Choice.** (b). It matches the one number the spec actually gives, and it means "use the data
model there" (this task's own instruction) holds literally — no field was added to `Decision`.

**Consequence.** The window length lives wherever it is computed (for now, a comment in
`src/fixtures/run-messy.ts`), not in the type. If a real system ever needs the window to vary
by risk or environment, that is the point to add the field back — a single global constant
does not fit that case.

---

## 0002 · The design system stays inside the app, for now

**Context.** `components/` and `styles/` together are the design system. The obvious
alternative is to publish them as separate packages, which is how a platform that lets AI
agents consume design standards would eventually do it.

**Options.** (a) Monorepo with `packages/ui` and `packages/tokens` from day one.
(b) Keep one app, but write the design system so it can be extracted later.

**Choice.** (b). One screen does not justify the build and release machinery of (a).

**Consequence.** The boundary has to be enforced by discipline instead of package limits:
`components/` and `styles/` never import from `features/` or `fixtures/`, and never contain
product concepts. An ESLint import rule guards this.

---

## 0001 · Light theme is the default

**Context.** The reviewer in this product is often a compliance or security person working
in bright, document-heavy environments, next to spreadsheets and PDFs.

**Options.** (a) Dark default, like most developer tools. (b) Light default, dark available.
(c) Follow the system setting only.

**Choice.** Light default, dark available, system preference respected on first load.

**Consequence.** Every component has to be designed twice, and tokens must be semantic
from day one. It also means the screenshots look unlike the usual dark AI-tool UI, which is
intentional.
