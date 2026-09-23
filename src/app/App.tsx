import { useState } from 'react'
import { ReviewList } from '../features/run/ReviewList'
import { RunReviewPage } from '../features/run/RunReviewPage'
import { shouldShowIntro } from './intro'
import { WelcomeIntro } from './WelcomeIntro'

/*
 * Application shell. The review page lives inside another service platform that owns the
 * global navigation, logo and main menu (docs/DECISIONS.md, 0042) — so this shell adds none of
 * its own. There is no router yet (AGENTS.md, Out of scope): `?run=<id>` picks the run,
 * defaulting to `run-messy-pending` (the longest, most demanding fixture, before anyone has
 * decided), and `?view=reviews` shows the "My reviews" list the breadcrumb leads back to.
 * `?run=run-does-not-exist` reaches the not-found state. `?delay=<ms>` slows the run's load on
 * purpose (lib/api.ts already supports this), to see the loading state — and how the welcome
 * intro hands off to it — in a real browser.
 *
 * The welcome intro (docs/DECISIONS.md, 0048) is laid over the page, not in place of it: the
 * page mounts, and starts loading its run, at the same moment the intro starts.
 */
function currentParams() {
  const params = new URLSearchParams(window.location.search)
  const delay = Number(params.get('delay'))
  return {
    view: params.get('view'),
    runId: params.get('run') ?? 'run-messy-pending',
    delayMs: Number.isFinite(delay) && delay > 0 ? delay : undefined,
  }
}

const runHref = (id: string) => `?run=${encodeURIComponent(id)}`

export default function App() {
  const { view, runId, delayMs } = currentParams()
  const [showIntro, setShowIntro] = useState(shouldShowIntro)
  return (
    <>
      <main className="min-h-screen bg-bg">
        {view === 'reviews' ? (
          <ReviewList runHref={runHref} />
        ) : (
          <RunReviewPage runId={runId} getRunOptions={delayMs ? { delayMs } : undefined} />
        )}
      </main>
      {showIntro && <WelcomeIntro onDone={() => setShowIntro(false)} />}
    </>
  )
}
