import { RunReviewPage } from '../features/run/RunReviewPage'

/**
 * The product wordmark — replaced with the user's second logo iteration: two lines of plain
 * bold text, "LEDGER" over "DEMO", not the earlier double-exposure SVG mark. `--color-primary`
 * (the same violet `ToggleChip`'s selected state and every accent element already uses) for
 * "DEMO" rather than a new colour — it's the closest existing token to the reference image's
 * purple, and reusing it keeps this the only accent colour in the app, not a second one
 * introduced just for the logo.
 */
function Wordmark() {
  return (
    <h1 className="mb-[var(--space-7)] text-page-title leading-none font-bold tracking-tight text-text-primary uppercase">
      Ledger
      <span className="block text-primary">Demo</span>
    </h1>
  )
}

/*
 * Application shell. There is no router yet (AGENTS.md, Out of scope), so which run loads is
 * read from `?run=<id>` — defaulting to `run-messy`, the longest and most demanding fixture —
 * rather than hard-coding a single one. This is also the easiest way to reach the not-found
 * state in a real browser: `?run=run-does-not-exist`.
 */
function currentRunId(): string {
  return new URLSearchParams(window.location.search).get('run') ?? 'run-messy'
}

export default function App() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
      {/* The page's own constant identity — not data about the run being reviewed, so it
       * lives here rather than in RunReviewPage. The Figma logo mark itself (see Wordmark
       * above), not a re-typeset "LEDGER"/"demo" pair — this is the exact artwork, not an
       * approximation of it in the heading font. */}
      <Wordmark />
      <RunReviewPage runId={currentRunId()} />
    </main>
  )
}
