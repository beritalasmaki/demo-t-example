# Decisions

A record of choices where there was a real trade-off. Newest first.

Each entry has four parts: the situation, the options, the choice, and what it means going forward.

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
