import type { Run } from '../lib/types'
import { runBlocked } from './run-blocked'
import { runClean } from './run-clean'
import { runMessy, runMessyPending } from './run-messy'

export { runBlocked, runClean, runMessy, runMessyPending }

/** Keyed by `Run.id`, as `src/lib/README.md` sketches `api.ts` consuming it. */
export const runs: Record<string, Run> = {
  [runClean.id]: runClean,
  [runBlocked.id]: runBlocked,
  [runMessyPending.id]: runMessyPending,
  [runMessy.id]: runMessy,
}
