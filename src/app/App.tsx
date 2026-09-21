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
    <main className="mx-auto max-w-4xl px-6 py-12">
      <RunReviewPage runId={currentRunId()} />
    </main>
  )
}
