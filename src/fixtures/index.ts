import type { Run } from '../lib/types'
import { runBlocked } from './run-blocked'
import { runClean } from './run-clean'
import { runMessy, runMessyPending } from './run-messy'
import { sampleRuns } from './sample-runs'

export { runBlocked, runClean, runMessy, runMessyPending, sampleRuns }

/** Keyed by `Run.id`, as `src/lib/README.md` sketches `api.ts` consuming it. */
export const runs: Record<string, Run> = {
  [runClean.id]: runClean,
  [runBlocked.id]: runBlocked,
  [runMessyPending.id]: runMessyPending,
  [runMessy.id]: runMessy,
  ...Object.fromEntries(sampleRuns.map((run) => [run.id, run])),
}
