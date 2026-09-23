

👀 View the screen: https://demo-t-example.vercel.app/ 

☝️ 21/9/2026: NOTE! Design is still in process. I built the base first before the UI polishes. However, first tokens have been built already: colors, fonts and spacing. More coming soon. Please check [`Design-folder to see the design plan.`](./design)

☝️ ALSO Storybook view page coming soon!

# What is "Ledger" aka. demo-t-example?
A single, production-quality screen called **Ledger**. 

An AI agent has produced a change to a customer's software. Before that change ships, a human reviewer needs to
understand what the agent did, see which policy gates passed or failed, judge how confident
the model was and why, and then approve, request changes, or reject.

This is a portfolio piece built to the standard of a real product surface, not a mockup. It
is not affiliated with any company, and every run in it is fictional.

- **Why this exists:** [`STORY.md`](./STORY.md)
- **What is being built, region by region:** [`docs/spec-review-screen.md`](./docs/spec-review-screen.md)
- **The rules this repository is built to** (stack, folder structure, dependency direction,
  design-system rules, definition of done): [`AGENTS.md`](./AGENTS.md)

## Stack

React 19 + TypeScript (strict) on Vite, Tailwind CSS with tokens exposed through its theme,
shadcn/ui, lucide-react. Vitest + React Testing Library for unit tests, Storybook for
components and tokens, Playwright planned for one end-to-end path. No backend — data comes
from typed fixtures behind a `getRun()` function, so a real API can replace it later without
touching the interface. See `AGENTS.md` for the full picture, including the folder structure
and why dependencies only point one way.

## Running it

```bash
npm install
npx playwright install chromium   # once — needed by npm run check's theme-bridge verification

npm run dev              # start the app
npm run storybook        # start Storybook, on components and design tokens

npm run check            # typecheck + lint + test — the gate for any change
npm run test:watch       # tests, watching
npm run lint:fix         # eslint --fix
npm run format           # prettier --write

npm run build             # production build of the app
npm run build-storybook   # static Storybook build
```

## Status

Scaffolding stage: the toolchain, design tokens and dependency-direction lint rule are in
place. 

Design is still in process. Iteration going on currently. Storybook view page in planning too.


