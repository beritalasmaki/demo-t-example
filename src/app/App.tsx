import { RunReviewPage } from '../features/run/RunReviewPage'

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
       * lives here rather than in RunReviewPage. font-heading comes from the h1 tag itself
       * (src/styles/index.css's base layer), so only the size and weight need stating. */}
      <h1 className="text-page-title mb-[var(--space-7)] font-bold text-text-primary">
        Agent run review <span className="font-normal text-text-secondary">— Demo</span>
      </h1>
      <RunReviewPage runId={currentRunId()} />
    </main>
  )
}
