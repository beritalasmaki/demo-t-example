# app

Page level: routing, layout, and anything that applies to the whole application — theme,
providers, top-level error handling.

Few files, all short. If you find yourself writing view logic here, it belongs in
`features/`. If you find yourself writing a reusable UI element here, it belongs in
`components/`.

## Files

- `App.tsx` — reads `?run=`, `?view=reviews` and `?delay=<ms>`, and lays the welcome intro over
  the page on a first visit.
- `WelcomeIntro.tsx`, `intro.ts`, `intro.css`, `SignatureMark.tsx` — the one-time welcome intro
  (docs/DECISIONS.md, 0048). `intro.ts` holds the first-visit flag (`ledger:intro-seen`) and the
  timings. `SignatureMark.tsx` holds the supplied signature path, unchanged.
