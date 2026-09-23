import { ReviewList } from '../features/run/ReviewList'
import { RunReviewPage } from '../features/run/RunReviewPage'

/*
 * Application shell. The review page lives inside another service platform that owns the
 * global navigation, logo and main menu (docs/DECISIONS.md, 0042) — so this shell adds none of
 * its own. There is no router yet (AGENTS.md, Out of scope): `?run=<id>` picks the run,
 * defaulting to `run-messy-pending` (the longest, most demanding fixture, before anyone has
 * decided), and `?view=reviews` shows the "My reviews" list the breadcrumb leads back to.
 * `?run=run-does-not-exist` reaches the not-found state.
 */
function currentParams() {
  const params = new URLSearchParams(window.location.search)
  return { view: params.get('view'), runId: params.get('run') ?? 'run-messy-pending' }
}

const runHref = (id: string) => `?run=${encodeURIComponent(id)}`

export default function App() {
  const { view, runId } = currentParams()
  return (
    <main className="min-h-screen bg-bg">
      {view === 'reviews' ? <ReviewList runHref={runHref} /> : <RunReviewPage runId={runId} />}
    </main>
  )
}
