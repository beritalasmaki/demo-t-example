# What is "Agent run review"?

View the screen: https://demo-t-example.vercel.app/ 
Also Storybook page coming soon!

A single, production-quality screen called the **agent run review view**. 

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
place; the review screen itself (`src/features/run/`) is not built yet. `docs/WORKLOG.md` has
a session-by-session account of what has been done and why.
