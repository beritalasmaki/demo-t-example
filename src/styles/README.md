# styles

The design system's foundation: `tokens.css` and the Tailwind theme that exposes it.

**Tokens are named by meaning, not by appearance.** `--color-status-pass`, not
`--color-green-600`. The name says what it is for, so the value can change without every
component having to.

Two layers:

1. **Primitives** — the raw values: `--violet-light`, `--neutral-3`. Plain custom properties,
   never Tailwind utilities.
2. **Semantic tokens** — what the product uses: `--color-primary`, `--color-status-pass`,
   `--color-surface-raised`, `--color-border-subtle`. Components only ever use these.

Both themes are defined here. Light is the default, because the reviewer often works in
bright, document-heavy environments; dark is available and the system preference is
respected on first load.

## Type

Raleway (500/600/700) for headings, buttons and the wordmark — `--font-heading`. Montserrat
(400/500) for body text and table/data text — `--font-body`. Both load via Google Fonts (see
`index.html`); neither varies by theme.

## Usage rules

- **Primary and accent are never used on Approve, Request changes or Reject.** Those three
  stay neutral. A brand colour on the decision actions would read as "the recommended
  option" or "the easy one," and the interface must never imply that (docs/spec-review-screen.md,
  Scenario S2; AGENTS.md non-negotiable 2).
- **Accent never resembles a status badge.** No check/cross icon on an accent element, and a
  different shape from a status chip — accent as an outline pill, status as a filled chip
  with icon + text. One is a brand colour, the other is a claim about a policy check; they
  must not be visually interchangeable.
- **Status is a separate palette from brand, and is never reused for non-status UI.** If
  something needs colour and it is not reporting a pass/fail/waived/not-applicable/unknown
  result, it does not get a status colour.
- **Status and accent colours are for the icon, border and swatch — never the text itself.**
  The label next to a status icon or inside an accent pill uses `--color-text-primary` or
  `--color-text-secondary`, not the status/accent colour. This is not a style preference: see
  the contrast numbers below.

## Contrast

Verified against every realistic pairing (WCAG relative-luminance formula, target 4.5:1 for
text). Full numbers were computed, not estimated — see `docs/DECISIONS.md`, 0005, for how.

- **Text tokens pass everywhere they're used.** `--color-text-primary` and
  `--color-text-secondary` clear 4.5:1 against `--color-bg`, `--color-surface` and
  `--color-surface-raised`, in both themes (5.7:1 to 16.7:1).
- **`--color-text-disabled` does not clear 4.5:1** (2.5–3.4:1 depending on theme and surface).
  Left as given: WCAG 1.4.3 does not require a minimum contrast for inactive UI text, and this
  token is not used for anything else.
- **Several status/accent colours fail 4.5:1 as literal text colour in light theme** —
  `--color-accent` (~3.1–3.3:1), `--color-status-pass` (~4.0–4.3:1), and
  `--color-status-not-applicable` on `--color-surface-raised` specifically (4.43:1). This is
  exactly why the usage rule above exists: used for an icon or a border (WCAG's 3:1
  non-text threshold), every one of these passes; used as running text, several would not. In
  dark theme every status and brand colour clears 4.5:1 even as text (5.1–10.1:1) — the
  dark-theme values were lightened with this in mind.
- **A filled primary (or destructive) surface needs different foreground text per theme.**
  White text on `--color-primary` passes in light (6.2:1) but fails in dark (2.8:1), because
  the dark-theme primary is deliberately lightened for its own contrast; near-black passes in
  dark (6.3:1) but fails in light (2.8:1). `--color-primary-foreground` (and
  `--color-destructive-foreground`, which reuses it) is defined to flip per theme rather than
  fixed to white — a real bug this check caught before it shipped.
- **`--color-border` and `--color-border-subtle` sit at 1.1–1.8:1 against every surface**, in
  both themes. Noted, not changed: borders aren't subject to the text-contrast rule, and these
  are the values given. Worth knowing if a border ever needs to carry meaning on its own.

Motion tokens live here too, and motion is functional only: state changes, data arriving,
focus. `prefers-reduced-motion` is respected.

This folder is also the artefact a design agent could read. Keep it tidy and documented in
Storybook — that is the point of writing design decisions as code.
