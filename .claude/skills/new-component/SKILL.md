---
name: new-component
description: Use whenever creating a new React component in src/components or src/features/run. Ensures tokens, states, accessibility, and a Storybook story are never forgotten.
---

# Building a new component

Follow this order. Do not skip a step because the component seems simple — the simple ones
are exactly where states get forgotten.

## 1. Decide where it lives

- Knows nothing about runs, gates or agents → `src/components/`
- Knows this product's concepts → `src/features/run/`
- If unsure, check the folder's README.md and re-read `AGENTS.md` → Structure.

## 2. List every state before writing any JSX

For this component specifically, write down: default, loading, empty, error, and any
product-specific state (e.g. a gate that is `unknown`, a decision already made by someone
else). Pull the state list from `docs/spec-review-screen.md` if the component appears there.

## 3. Build with tokens only

No raw hex, no literal pixel values, no ad-hoc font sizes. Every colour, space and radius
comes from `src/styles/tokens.css` via the Tailwind theme. If a value you need does not
exist as a token, stop and ask — do not invent a one-off value.

## 4. Accessibility, while writing, not after

- Every interactive element reachable and operable by keyboard
- Visible focus state
- Status conveyed by icon + text, never colour alone
- Text contrast at least 4.5:1 in both themes

## 5. Write the Storybook story

One story per state from step 2, including error and empty. Name stories after the state,
not after a scenario ("Failed" not "Scenario1"). If the component is stateful, add a story
that exercises the keyboard path.

## 6. Check both themes

Render the component in light and dark. Light is the default theme for this product.

## 7. Update the folder README if the rule for what belongs there changed

Only if it changed — do not add noise for its own sake.

## 8. Commit

One commit for the component, one for its story if it was written separately. Conventional
commit message (`feat: add PolicyGateRow component`).

Do not write the WORKLOG entry here — that happens once at the end of the session. See the
`worklog-entry` skill.
