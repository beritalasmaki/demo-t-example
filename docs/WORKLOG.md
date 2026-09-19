# Worklog

One entry per work session, newest first. Written so that a designer can repeat the same
work by hand. Agents: copy the template, fill every field, keep it short and concrete.

---

## Template

### YYYY-MM-DD · <short title>

**Goal**
One sentence: what we set out to do.

**What changed**
Bullet list of files and what happened in each. Mention the commit(s).

**Steps, in order**
Numbered list of the actual steps, with the commands run. Write it as instructions, not as
a story: "1. Created `src/lib/types.ts` and defined `Run`, `TimelineEvent`, `PolicyGate`."
Include the exact commands (`npm create vite@latest`, `npx shadcn@latest add table`, …).

**Why it was done this way**
The reasoning behind the non-obvious choices. If there was a trade-off worth keeping,
also add it to `DECISIONS.md`.

**How to do this by hand**
The manual version of the same work, for learning: which files to create, what to click in
Figma or Storybook, what to check. Skip this field only when it is identical to the steps.

**Verification**
What was run and what the result was: `npm run check`, tests, manual keyboard pass,
contrast check, screenshots taken.

**Open questions / next**
What is unfinished, uncertain, or should be decided by a human.

---

<!-- New entries go below this line, newest first. -->

### 2026-09-19 · Data layer: src/lib/types.ts, the three fixtures, src/lib/api.ts

**Goal**
Implement the data model from `docs/spec-review-screen.md` as `src/lib/types.ts`, build the
three fixtures it calls for, and add `src/lib/api.ts` as the seam in front of them. No UI.

**What changed**
- `src/lib/types.ts` — `RunStatus`, `GateResult`, `PolicyGate`, `TimelineEvent`,
  `ConfidenceArea`, `Decision`, `Run` from the spec's Data model, plus `DecisionInput` (not in
  the spec, needed for `submitDecision`). Doc comments tie each `RunStatus`/`GateResult` value
  to its exact Content rules label.
- `docs/DECISIONS.md` — two new entries (0003, 0004) for the two places this work departed
  from copying the spec's interfaces literally.
- `src/fixtures/run-messy.ts`, `run-blocked.ts`, `run-clean.ts` (+ a test file each) and
  `src/fixtures/index.ts` (the `runs` barrel).
- `src/lib/api.ts` (+ test) — `getRun`, `submitDecision`, and four error classes.
- Commits: `8883d8d` (types), `a7991ea` (run-messy), `0b79baa` (run-blocked), `9a94cb2`
  (run-clean + barrel + a wording fix that landed across all three fixtures), `e99e204` (api).

**Steps, in order**
1. Read `docs/spec-review-screen.md` in full before writing anything, including the sections
   Berit had added since the last session (Scenarios, Content rules, Hierarchy, Acceptance
   criteria) — the task asked to align with Content rules specifically, so I needed the
   current file, not the one from the scaffold session.
2. Wrote `types.ts`. Two places the literal Data model section wasn't enough on its own:
   `submitDecision`'s input shape (not defined anywhere in the spec), and the undo window
   (described in three other sections of the same document, with no field for it anywhere).
   Wrote both up as `docs/DECISIONS.md` entries rather than silently extending the interface
   or silently ignoring the gap.
3. Built the fixtures in the requested order (messy, blocked, clean), each as one
   self-contained file — no shared gate-catalog module, since `fixtures/README.md` frames each
   one as a standalone example a reader might open on its own.
4. For each fixture, wrote a small test asserting every `evidenceIds` value resolves to a real
   timeline event id. Nothing else in the toolchain would catch a typo'd id, and the whole
   point of the evidence field is that it is trustworthy.
5. Caught two inconsistencies by re-reading my own fixtures against the rules I'd just applied,
   before running out the clock on the task: `run-clean`'s summary said "Two files changed"
   against three actual `file_change` events (fixed to three, then to "3" — see next point);
   and separately, realized "Two files changed" itself was copying Region 2's illustrative
   sentence rather than following Content rules' own explicit later instruction — "'3 files
   changed', not '3'" — which says digits, not words. Fixed all three fixtures' file/test-count
   sentences to digits in the same pass (`9a94cb2`), leaving "One check failed: `<name>`"-style
   sentences as word-form since those directly mirror Region 2's own phrasing rather than being
   a bare count.
6. Wrote `src/lib/api.ts` matching the sketch already in `lib/README.md` almost exactly
   (including its exact class name, `NotFoundError`, rather than one I'd have picked myself),
   plus what this task additionally asked for: `NetworkError`, `DecisionConflictError`,
   `ValidationError`, and the `delayMs`/`simulateNetworkError`/`simulateConflict` options.
7. Wrote `api.test.ts`. Found a real bug in the test design, not the code, while writing it: a
   test asserting "approving needs no written reason" would have been the only test in the file
   to leave `run-clean` with a recorded decision, which would have made two *other* tests
   (expecting `ValidationError` for a missing reason) get `DecisionConflictError` instead if
   vitest ever ran them in a different order than written. Deleted that test — the same
   assertion is already covered by the "records who and when" test on `run-blocked`, which
   never needed a reason in the first place — rather than leave a passing-but-order-dependent
   test in the suite.
8. `npm run check` after every file; `npx prettier --write` on each new/changed file before the
   final check in that step.

**Why it was done this way**
- Two deviations from the literal spec (`DecisionInput`, and no field for the undo window) are
  both logged in `DECISIONS.md` rather than either bolted on silently or left unresolved. This
  is exactly the situation `AGENTS.md`'s "If something in this file turns out to be wrong or
  unhelpful, say so and propose a change" line is for, just applied to the spec document
  instead of `AGENTS.md` itself — the right move for a genuine gap is to name it, not route
  around it.
- The Content rules "digit, not word" fix is a small thing that would have been easy to miss
  entirely (Region 2's own worked example uses the word form, and I had been treating it as the
  canonical phrasing to reuse). It only surfaced because a test's assertion depended on an exact
  digit substring match — a case where writing the test first, not after, caught a content bug
  the checklist-reading pass alone had missed.
- `run-messy`'s `acknowledgedGateIds` is empty despite approving a production release over two
  unresolved checks. This is not an oversight — Content rules' sign-off rule is written to
  cover only failed and waived gates — but it reads like a gap in the spec itself, and I did
  not feel it was mine to close by inventing an unknown-gate acknowledgment rule that isn't
  written down anywhere. Flagged in the run-messy commit message and again here.

**How to do this by hand**
Read the spec's Data model section and transcribe each interface as-is first; only then read
the rest of the document (Scenarios, Content rules, Hierarchy, Acceptance criteria) looking
specifically for anything the Data model section doesn't have a place for — an undo window, a
sign-off tick, a specific display label — and decide, for each one, whether it is a type-level
gap (needs a field or a whole new interface) or a display-level concern (belongs in a comment
or in `format.ts` later, not in the type itself). Build the fixtures in whatever order gives
the most awkward one first; writing the boring one (`run-clean`) first tends to hide exactly
the layout and content problems the awkward ones are supposed to expose. For each fixture,
manually walk every `evidenceIds` array against the `timeline` array and check that each id
resolves — this is exactly what the per-fixture tests now do automatically.

**Verification**
`npm run check` green after every one of the five commits (27 tests passing by the end, up
from 5). Each fixture has a test asserting internal consistency (evidence ids resolve, a
waiver names who and why, the one error is followed by its retry, gate results are what the
fixture claims). `api.test.ts` covers: not-found for an unknown id; a controllable delay via
fake timers, so the "slow response" path is proven without an actual multi-second test;
`getRun` returning a copy rather than a live reference; a successful decision persisting
across a subsequent `getRun`; a simulated network failure; a real conflict (via `run-messy`,
with no flag needed) and a simulated one (via `run-clean`); and the written-reason requirement
for `changes_requested` and `rejected` but not `approved`.

**Open questions / next**
- Whether `run-messy`'s empty `acknowledgedGateIds` (approving into production over two
  `unknown` gates with nothing to tick) should stay that way, or whether the sign-off rule in
  Content rules should be widened to cover `unknown` gates too — this is Berit's call, not
  mine to make unilaterally.
- `src/lib/format.ts` is documented in `lib/README.md` but still does not exist. The
  `RunStatus`/`GateResult` display labels this task added as doc comments in `types.ts` are
  the natural seed for it, once UI work actually needs them turned into runtime strings.
- No component, fixture consumer, or screen exists yet. Next task per `AGENTS.md`: plan the
  first piece of `src/features/run/` against this data layer.



**Goal**
Turn the empty repository plus its instructions and spec into a runnable toolchain: Vite,
React 19, TypeScript strict, Tailwind with tokens, shadcn/ui (init only), lucide-react,
Vitest + React Testing Library, Storybook, ESLint + Prettier, an `npm run check` script, and
the dependency-direction rule from `AGENTS.md` enforced as a lint rule rather than left as a
convention to remember. No screen was built; `src/app/App.tsx` is a placeholder shell.

**What changed**
- `package.json`, `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json` +
  `tsconfig.storybook.json`, `vite.config.ts`, `vitest.setup.ts`, `index.html` — the toolchain.
- `src/main.tsx`, `src/app/App.tsx` (+ `App.test.tsx`) — the smallest real shell the toolchain
  could typecheck, lint and test against.
- `src/styles/tokens.css` — primitives and semantic tokens in two layers, light default, dark
  via `prefers-color-scheme` or `data-theme`, motion tokens respecting `prefers-reduced-motion`.
- `src/styles/index.css` — Tailwind entry, plus a bridge mapping shadcn's fixed names
  (`background`, `card`, `muted-foreground`, `border`, `ring`, …) onto the semantic tokens, so
  there is one palette rather than two.
- `components.json`, `src/lib/utils.ts` (+ test) — shadcn/ui wiring by hand (see below).
- `eslint.config.js`, `.prettierrc.json`, `.prettierignore` — lint and format, with
  `import/no-restricted-paths` encoding `fixtures → lib → components → features → app`.
- `.storybook/main.ts`, `.storybook/preview.tsx`, `src/styles/tokens.stories.tsx` — Storybook,
  trimmed down from what its installer proposed (see below), plus a live tokens story.
- `README.md` — what this project is, how to run it, links to `STORY.md`,
  `docs/spec-review-screen.md` and `AGENTS.md`.
- Commits: `c96152b` (Vite/React/TS/Tailwind), `2964082` (shadcn/lucide wiring),
  `5fe9348` (ESLint/Prettier/check), `22deae7` (Storybook).

**Steps, in order**
1. `npm create vite@latest viteseed -- --template react-ts` in the scratchpad, to see the
   current template's defaults before committing to any of them by hand.
2. Wrote `package.json` and the three tsconfigs by hand rather than copying the template,
   setting `"strict": true` explicitly — the current Vite template does not set it, and
   `AGENTS.md` requires it.
3. Wrote `vite.config.ts` (with `@tailwindcss/vite` and the `@` alias), `vitest.setup.ts`
   (`@testing-library/jest-dom` + `cleanup()`), `index.html`, `src/main.tsx`,
   `src/app/App.tsx`, `src/app/App.test.tsx`.
4. `npm install react react-dom lucide-react`, then
   `npm install -D vite @vitejs/plugin-react typescript @types/node @types/react
   @types/react-dom tailwindcss @tailwindcss/vite`, then
   `npm install -D vitest jsdom @testing-library/react @testing-library/dom
   @testing-library/jest-dom @testing-library/user-event`.
5. `npm run typecheck` failed: TypeScript 7 removed `baseUrl` (`paths` now resolves relative
   to the tsconfig itself) — removed it from `tsconfig.app.json`.
6. Wrote `src/styles/tokens.css` and `src/styles/index.css`, `npm run build`, then grepped the
   built CSS for `color-status-pass-fg` and the dark-mode media query to confirm the tokens
   actually reached the output rather than trusting the source alone.
7. `npx shadcn@latest init` failed: `ui.shadcn.com` is blocked by this session's egress
   policy (403 on CONNECT, confirmed via the proxy status endpoint). Did the equivalent by
   hand: `npm install -D class-variance-authority clsx tailwind-merge tw-animate-css`, moved
   the three that ship in component code from `devDependencies` to `dependencies`, wrote
   `components.json` and `src/lib/utils.ts` (`cn()`) plus a unit test for it, and added the
   shadcn-name bridge to `src/styles/index.css`. Renamed our accent token to `--color-action`
   first — shadcn's "accent" means a quiet hover surface, ours meant brand blue, and one name
   cannot mean both. Verified the bridge with a throwaway probe component using
   `bg-background`, `text-muted-foreground`, etc., grepped the built CSS to confirm each
   resolved to our token, then deleted the probe. Left a note in `index.css` that the mapping
   is unverified against a real shadcn-generated component, since none could be added.
8. `npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks
   eslint-plugin-react-refresh eslint-plugin-import eslint-import-resolver-typescript
   prettier eslint-config-prettier globals` failed on peer conflicts twice: `typescript-eslint`
   does not yet support TypeScript 7 (peer range `>=4.8.4 <6.1.0`), and `eslint-plugin-import`
   does not yet support ESLint 10. Pinned `typescript@~5.9.0` and `eslint@^9` and reinstalled.
9. Wrote `eslint.config.js`: typescript-eslint's `recommendedTypeChecked`, react-hooks,
   react-refresh, `eslint-plugin-import`'s recommended config, and
   `import/no-restricted-paths` with one zone per rule in `AGENTS.md`'s dependency direction.
   Worked through three real errors along the way: `eslint.config.js` itself needed
   `disableTypeChecked` (it is plain JS with no tsconfig of its own); the `import/resolver`
   settings had to live in a global block, not one scoped to `**/*.{ts,tsx}`, because
   `import/no-unresolved` from the recommended config applies to every file including that
   same `eslint.config.js`; and the multiple-tsconfig performance warning needed
   `noWarnOnMultipleProjects: true` on the resolver, not a typescript-eslint option.
10. Proved the dependency-direction rule actually fires, rather than trusting the config:
    added a throwaway `src/lib/_violation-check.ts` importing from `src/components/`, ran
    `npx eslint` on it, watched `import/no-restricted-paths` catch it with the exact message
    from `AGENTS.md`, then deleted both temporary files immediately.
11. `.prettierrc.json`, `.prettierignore`, `npx prettier --check .` — flagged
    `docs/spec-review-screen.md` and `src/features/run/README.md` from the earlier commit.
    Diffed what `--write` would do to them (quote style, and reflowing the TypeScript inside
    their code fences) and confirmed it would break "byte for byte, do not reformat" from that
    commit, so added every hand-authored spec/instruction file to `.prettierignore` by name
    instead of running Prettier over them.
12. Added `typecheck`, `lint`, `lint:fix`, `format`, `format:check`, `check` scripts;
    `npm run check` green.
13. `npx storybook@latest init --type react --builder vite` — it also proposed
    `@chromatic-com/storybook`, `@storybook/addon-mcp`, and `@storybook/addon-vitest` (which
    pulled in Playwright, `@vitest/browser-playwright`, `@vitest/coverage-v8`, and rewrote
    `vite.config.ts` into a projects workspace). None of that was asked for, and the vitest
    addon duplicates work `AGENTS.md` reserves for a separate Playwright end-to-end setup.
    `npm uninstall` the four packages plus `playwright`, restored `vite.config.ts` and
    `eslint.config.js` to hand-written form, deleted the canned demo stories in `src/stories/`.
14. `.storybook/main.ts` down to `addon-a11y` and `addon-docs`; set `a11y.test = 'error'` in
    `.storybook/preview.tsx` so a violation fails the story rather than only flagging it.
15. `.storybook/preview.tsx` and `.storybook/main.ts` needed a real tsconfig — the
    `allowDefaultProject` fallback used for `eslint.config.js` only covers plain JS, and these
    are typed against `@storybook/react-vite`. Added `tsconfig.storybook.json`, referenced it
    from the root `tsconfig.json`, and added it to the ESLint import resolver's project list.
16. Wrote `src/styles/tokens.stories.tsx`: not a component, a live rendering of the status and
    surface tokens, with a `theme` toolbar global and a decorator that sets
    `document.documentElement.dataset.theme`, so Light and Dark are two real story variants
    rather than a screenshot of the CSS.
17. `npm run check` and `npx storybook build` to a scratch directory; grepped the built CSS
    for `color-status-pass-fg` and the built `index.json` for the story's title to confirm the
    tokens and the story both actually landed, not just that the build exited zero.
18. Wrote the root `README.md`.

**Why it was done this way**
- TypeScript strict, ESLint's dependency-direction rule, and the shadcn/token bridge are all
  cases of turning a sentence in `AGENTS.md` into something a tool checks, rather than
  something to remember. That is the whole point of `import/no-restricted-paths`: a future
  session (agent or human) importing the wrong way gets a lint error naming the exact rule in
  `AGENTS.md`, not a silent architectural drift discovered months later.
- Every one of the version pins (TypeScript 5.9, ESLint 9) and the by-hand shadcn init came
  from a real, reproduced failure — not a guess at what might be safest. Each is logged above
  with what broke and what the fix was, so a future upgrade attempt has something concrete to
  retry against instead of rediscovering the same peer conflict.
- Storybook's installer proposing a hosted SaaS integration, an MCP addon, and a second test
  runner by default is worth knowing about, not just quietly working around: `AGENTS.md` says
  "ask before adding a dependency," and a generator adding six is the same decision made for
  you. Trimming it back to the three tools actually asked for was the judgment call; the
  removal is recorded here rather than left to be discovered later as an unexplained gap
  between what a fresh `storybook init` would produce and what this repo has.

**How to do this by hand**
Run `npm create vite@latest -- --template react-ts` for the shape of a Vite + React + TS
project, then rewrite `tsconfig.app.json` to add `"strict": true` and the `@/*` path alias.
Add Tailwind via `npm install tailwindcss @tailwindcss/vite`, add the plugin to
`vite.config.ts`, and write `tokens.css` as two layers (primitives as plain custom
properties, semantic tokens inside `@theme`) rather than reaching for arbitrary Tailwind
colors. For shadcn/ui without network access to its registry: install
`class-variance-authority`, `clsx`, `tailwind-merge` as real dependencies, write a `cn()`
helper, and write `components.json` by hand referencing the same file paths. For the
dependency-direction rule, read `eslint-plugin-import`'s `no-restricted-paths` docs and write
one `zones` entry per arrow in `AGENTS.md`'s "Dependencies point one way" sentence, then
prove each one by writing a small file that violates it and confirming the linter refuses it,
the same way tests prove code by trying to break it.

**Verification**
`npm run check` (typecheck + lint + test) green at every commit in this session.
`npm run build` and `npx storybook build` both succeed. Grepped built output (not just source)
to confirm design tokens and the dependency-direction rule are real: the built app CSS
contains the status tokens and the dark-theme media query; a deliberately-violating import was
caught by name and message; the Storybook build's CSS and `index.json` contain the tokens and
the new story respectively. `npx prettier --check .` and `npx eslint .` both clean.

**Open questions / next**
- `ui.shadcn.com` is blocked by this session's network policy, so the shadcn/ui → token bridge
  in `src/styles/index.css` has never been checked against an actual generated component —
  only against a throwaway probe using the same class names. Worth a real check (e.g. adding
  `button` or `badge`) the first time network access allows it, or by hand-porting one
  component's source from the shadcn docs.
- TypeScript is pinned to `~5.9.0` (not 7) because `typescript-eslint` doesn't support 7 yet;
  ESLint is pinned to `^9` (not 10) because `eslint-plugin-import` doesn't support 10 yet.
  Worth revisiting both pins once upstream catches up.
- `PROJECT-SETUP.md`, which this task's instructions said to delete, does not exist anywhere
  in the repository or its git history — nothing was deleted, since there was nothing to
  delete.
- No real component, fixture, or screen exists yet. Next task per `AGENTS.md`: plan the first
  piece of `src/features/run/` (or the fixtures it depends on) and get it accepted before
  building.

