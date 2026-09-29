# components

Reusable UI parts that know nothing about runs, gates or agents.

**`ui/` is shadcn/ui** (docs/DECISIONS.md, 0070): Badge, Button, Checkbox, Collapsible, Dialog,
Input, NativeSelect, RadioGroup, Sonner, Switch, Table, Tabs, Textarea and Tooltip. Each was
fetched from shadcn-ui/ui on GitHub (the registry is blocked here) and restyled onto our
tokens. The API stays shadcn's, with a few additions, each noted in the file's header comment.
Every control in the app is built from these. The files beside `ui/` put them together for
this app: `Modal` (Dialog), `Tabs` (Tabs, with a sliding pill), `InfoTip` (Tooltip),
`StatusBadge` (Badge), `ThemeToggle` (Switch) and `notify` (Sonner).

**The test:** would this component work, unchanged, in a completely different product? If
yes, it belongs here. If it needs to know what a policy gate is, it belongs in `features/run/`.

Rules:

- Presentational only — no data fetching, no `lib/api` imports. Data arrives as props.
- All values come from tokens (`src/styles/tokens.css`). No raw hex, no magic pixel values.
- Every state a component can be in has a Storybook story, including empty and error.
- Status is never carried by colour alone: icon plus text as well.

`Tabs` has three variants: `segmented`, `pill` and `line`. The pill variant has a sliding
background from transitions.dev (docs/DECISIONS.md, 0047) and optional per-tab tooltips
(`tooltip`). `line` is underlined text tabs for filtering one list (0060).

`InfoTip` is the small "i" that explains a label, on hover and keyboard focus. `notify()`
shows a short confirmation that stays until closed; the page renders `<Toaster />` for it. Both
come from the My reviews design (0060).

`ThemeToggle` switches light and dark (docs/DECISIONS.md, 0063); `theme.ts` reads and sets the
page's theme for it.

`LoadingState` is the loading indicator: the `thinking-orbs` "working" orb with a label under
it, centred (docs/DECISIONS.md, 0050). It is the one component here built on a third-party
visual. jsdom can't draw it, so the test setup stubs the canvas.

`spotlight(element)` plays the `.t-spotlight` animation on any element (docs/DECISIONS.md,
0056). It is a function, not a component, and it lives here rather than in `lib/` because it
works on the page's elements.
