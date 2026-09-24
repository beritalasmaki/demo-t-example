# components

Reusable UI parts that know nothing about runs, gates or agents: buttons, table, badges,
empty states, timestamps. shadcn/ui components go in `ui/` when one is added (none is in use
now; the theme bridge in `src/styles/index.css` is ready for them).

**The test:** would this component work, unchanged, in a completely different product? If
yes, it belongs here. If it needs to know what a policy gate is, it belongs in `features/run/`.

Rules:

- Presentational only — no data fetching, no `lib/api` imports. Data arrives as props.
- All values come from tokens (`src/styles/tokens.css`). No raw hex, no magic pixel values.
- Every state a component can be in has a Storybook story, including empty and error.
- Status is never carried by colour alone: icon plus text as well.

`Tabs` has three variants: `segmented`, `pill` and `line`. The pill variant has a sliding
background and optional per-tab tooltips (`tooltip`), both from transitions.dev
(docs/DECISIONS.md, 0047). `line` is underlined text tabs for filtering one list (0060).

`InfoTip` is the small "i" that explains a label, on hover and keyboard focus. `Toast` is a
short confirmation that stays until closed. Both come from the My reviews design (0060).
`tooltipPlacement.ts` keeps any `.t-tt` tooltip inside the window; `Tabs` and `InfoTip` use it.

`LoadingState` is the loading indicator: the `thinking-orbs` "working" orb with a label under
it, centred (docs/DECISIONS.md, 0050). It is the one component here built on a third-party
visual. jsdom can't draw it, so the test setup stubs the canvas.

`spotlight(element)` plays the `.t-spotlight` animation on any element (docs/DECISIONS.md,
0056). It is a function, not a component, and it lives here rather than in `lib/` because it
works on the page's elements.
