# Decisions

A record of choices where there was a real trade-off. Newest first.

Each entry has four parts: the situation, the options, the choice, and what it means going forward.

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
