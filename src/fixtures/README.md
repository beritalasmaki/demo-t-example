# fixtures

Sample runs, typed as `Run` from `lib/types`, so the compiler tells us when the data and the
model drift apart. All of it is fictional: no real companies, customers or systems.

Three runs, because the design work lives in the awkward cases:

- **`run-clean.ts`** — everything passed, awaiting review. Should be boring and quick.
- **`run-blocked.ts`** — one gate failed, one waived, low confidence on side effects, an
  agent error and a retry in the timeline.
- **`run-messy.ts`** — long run, missing values (`unknown` gates, one area with no
  confidence), a production target, and a decision already recorded with an undo window and a
  reason. Also exports **`runMessyPending`** (`run-messy-pending`): the same run before anyone
  decided — design 1a, and the page the app opens on.

Every run has a `story` (the Story view, each step linked to its evidence) and an
`assignment` (why the agent was asked). People have ordinary Finnish names; systems carry a
version ("policy-engine v2.3").

Build the messy one first. It exposes the layout and content problems while they are still
cheap to fix; designing for the clean run first hides them.

Keep the writing realistic: real rule names, real-sounding file paths, plain-language
descriptions written the way a policy author would write them.
