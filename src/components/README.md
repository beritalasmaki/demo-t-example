# components

Reusable UI parts that know nothing about runs, gates or agents: buttons, table, badges,
empty states, timestamps. shadcn/ui components live here too.

**The test:** would this component work, unchanged, in a completely different product? If
yes, it belongs here. If it needs to know what a policy gate is, it belongs in `features/run/`.

Rules:

- Presentational only — no data fetching, no `lib/api` imports. Data arrives as props.
- All values come from tokens (`src/styles/tokens.css`). No raw hex, no magic pixel values.
- Every state a component can be in has a Storybook story, including empty and error.
- Status is never carried by colour alone: icon plus text as well.

`Tabs` has two variants: `segmented` and `pill`. The pill variant has a sliding background and
optional per-tab tooltips (`tooltip`), both from transitions.dev (docs/DECISIONS.md, 0047).
