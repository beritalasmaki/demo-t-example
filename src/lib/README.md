# lib

Code with no user interface: types, formatting, data access, small helpers.

**Why this folder exists.** Some things are needed by several parts of the app and belong to
none of them. If a date formatter lives inside a component, the next component writes its
own version, and two screens start showing time differently. Putting these in one place
means one definition, one test, one thing to change.

**Dependencies run one way.** Nothing here imports from `components/`, `features/` or
`app/`; they import from here. `lib` knows nothing about the interface, while the interface
uses `lib` freely.

Keeping that direction is what stops the codebase from tangling as it grows. Once two
folders import from each other, moving or deleting anything means tracing the whole loop
first, and a change in a component can break something that has no visible connection to it.
With one direction, the rule is simple: you can always read the code from the bottom up,
and `lib` can be tested on its own with no UI at all.

## Files

- **`types.ts`** — the shape of the data: `Run`, `PolicyGate`, `TimelineEvent`,
  `ConfidenceArea`, `Decision`. Everything else in the app refers to these types, so a change
  here shows up as a compiler error everywhere it matters. That is the point.
- **`format.ts`** — how values are turned into text: timestamps, durations, confidence
  values, relative times ("4 minutes ago"). Rules like "confidence is shown as a whole
  percentage, and an unknown value is shown as the word unknown" live here, not in a
  component.
- **`api.ts`** — the only place that fetches data. See below.
- **`gates.ts`** — small domain helpers that are not UI: sorting gates so failed and waived
  come first, and `gateAcknowledgement`, the counts and ids behind the Decision region's
  sign-off tick.
- **`decision.ts`** — the undo window: a fixed policy computed from `Decision.at`
  (docs/DECISIONS.md, 0003), not stored data.
- **`timeline.ts`** — the same kind of helper for the audit log: the shape of a run (step,
  error and retry counts), filtering that never actually hides an error or a retry, only
  shrinks the count of what's genuinely excluded, and `resolveEvidenceIds`, which both
  `gates.ts` and `summary.ts` use to turn a list of evidence ids into the real timeline events
  they point to.
- **`summary.ts`** — resolves the run summary's sentences against the timeline and drops any
  sentence whose evidence doesn't resolve to a real event, per docs/spec-review-screen.md's
  "a sentence with no evidence does not render."
- **`utils.ts`** — `cn()`, the class-name merger every shadcn/ui component expects at the
  `utils` alias in `components.json`. It lives here because that is where shadcn looks, and
  because `components/` is allowed to import from `lib`.

## What `api.ts` actually does

It is the seam between the interface and wherever the data comes from. Today there is no
backend, so it reads a fixture and returns it:

```ts
import type { Run } from "./types";
import { runs } from "../fixtures";

export async function getRun(id: string): Promise<Run> {
  await delay(400);                       // so loading states are real, not theoretical
  const run = runs[id];
  if (!run) throw new NotFoundError(id);
  return run;
}

export async function submitDecision(
  runId: string,
  decision: DecisionInput,
): Promise<Run> { … }
```

Three reasons to write it this way instead of importing fixtures straight into components:

1. **Components never learn where data comes from.** Replacing the fixture with a real
   `fetch` later touches this file only.
2. **It is async and can fail.** That forces the loading, error and empty states to be
   designed, which is most of the real work in this kind of screen.
3. **It can misbehave on purpose.** Slow responses, a run that changed while you were
   reading it, a rejected decision — all can be simulated here and designed for.
