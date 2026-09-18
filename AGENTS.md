# AGENTS.md

Instructions for any AI agent working in this repository. Humans: read this too — it is the
shortest description of how this project works.

## What this project is

A single, production-quality screen: the **agent run review view**. An AI agent has produced
a change to a customer's software. Before that change can be released, a human reviewer
has to understand what the agent did, see which policy gates passed or failed, judge how
confident the model was and why, and then approve, request changes, or reject.

This is a portfolio piece built to the standard of a real product surface, not a mockup.
It is not affiliated with any company, and all data in it is fictional.

Content spec: `docs/spec-review-screen.md`. Domain vocabulary: `src/features/run/README.md`.

## Non-negotiables

1. **The reviewer is not the author.** Every screen state must be understandable by a
   compliance officer or a security lead who did not write the code and does not read diffs
   for a living. Jargon needs a plain-language line next to it.
2. **Nothing is decided by the UI.** The interface never implies the agent's judgment is
   final. A human decision is always explicit, recorded, attributable and reversible before
   release.
3. **No claim without a source.** Every number, status and confidence value on screen must
   come from data in the model, and must link to the evidence it came from. If a value is
   unknown, the UI says "unknown" — it never guesses or hides it.
4. **Accessibility is part of "done".** Keyboard path for every action, visible focus,
   contrast of at least 4.5:1 for text, status never carried by colour alone (icon + text).
5. **No invented product facts.** Do not put real company names, customers, logos or
   claims into the UI. Sample data is clearly fictional.

## Stack

- React 19 + TypeScript (strict), Vite
- Tailwind CSS, shadcn/ui, lucide-react icons
- Vitest + React Testing Library, Playwright for one end-to-end path
- Storybook for components and tokens
- No backend. Data comes from typed fixtures in `src/fixtures/`, behind a `getRun()` function
  in `src/lib/api.ts` so a real API can replace it later.

## Structure

```
src/
  app/            routes, layout, providers, theme
  components/     reusable UI that knows nothing about this product
  features/run/   the review view: header, gates, timeline, confidence, decision
  lib/            types, formatting, data access, small domain helpers
  fixtures/       sample runs, deliberately including messy ones
  styles/         tokens.css + Tailwind theme
docs/
  spec-review-screen.md   what is being built and why
  DECISIONS.md            choices with trade-offs
  WORKLOG.md              one entry per work session
  notes.md                raw notes, material for STORY.md
```

**Every folder under `src/` has a README.md** saying what belongs there and why. Read it
before adding files, and update it when the rule changes rather than quietly breaking it.

**Dependencies point one way:** `fixtures → lib → components → features → app`. Never the
other way. `lib` knows nothing about the interface; the interface uses `lib` freely. This is
what keeps the codebase readable as it grows, and it lets `lib` be tested with no UI at all.

**`components/` + `styles/` together are the design system.** They are written to be
extractable into their own packages later, so they must not import from `features/` or
`fixtures/`, and must not contain product concepts such as policy gates.

## Design system rules

- All colour, spacing, radius, type-size and motion values come from tokens in
  `src/styles/tokens.css`, exposed to Tailwind via the theme. No raw hex in components.
- Semantic tokens over literal ones: `--color-status-blocked`, not `--color-red-500`.
- Both light and dark themes must work. Light is the default: these users work in
  document-heavy, bright environments.
- Motion is functional only: state changes, entering data, focus. Nothing decorative.
  Respect `prefers-reduced-motion`.
- Target: a new screen can be built without adding a single new colour or spacing value.

## How to work

- **Plan before building.** For anything larger than a small fix, describe the plan and wait
  for a human to accept it.
- **Small commits.** One logical change per commit, conventional commit messages
  (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
- **Update `docs/WORKLOG.md` at the end of every session**, using the template at the top
  of that file. Write it for a designer who wants to learn how to do the same work by hand:
  what you did, in what order, which commands you ran, and why.
- **Record decisions with trade-offs in `docs/DECISIONS.md`**, one short entry each:
  context, options considered, choice, consequence.
- **At the end of every session, after the WORKLOG entry, ask the human one question:**
  "Anything for `docs/notes.md` from this session — something that surprised you, something
  I got wrong, or a decision you changed your mind about?" Append their answer under
  today's date.
- Ask before adding a dependency, changing the stack, or restructuring folders.
- Do not commit generated screenshots, `node_modules`, or `.env` files.
- If something in this file turns out to be wrong or unhelpful, say so and propose a change
  rather than silently ignoring it.

## Definition of done for any UI work

- Typechecks, lints, tests pass (`npm run check`)
- Keyboard-only path works
- Light and dark theme both correct
- Empty, loading, error and "data is missing" states exist
- Storybook story added for new components
- Folder README still accurate
- WORKLOG entry written, and `docs/notes.md` updated or explicitly skipped
