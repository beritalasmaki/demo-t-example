import { runs as seedRuns } from '../fixtures'
import type { Decision, DecisionInput, Run } from './types'

/**
 * The only place that fetches data — see src/lib/README.md, "What api.ts actually does".
 * Today there is no backend, so it reads and writes an in-memory copy of the fixtures.
 * Replacing this with a real API later should not require touching anything that calls it.
 */

const DEFAULT_DELAY_MS = 400

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// A mutable copy, so a decision persists across calls within one session without mutating the
// fixtures themselves. Resets whenever the module is reloaded — fine for a fixture-backed
// dev/test environment with no real backend.
const store: Record<string, Run> = { ...seedRuns }

/** Any id not in the fixtures triggers this — see `NOT_FOUND_RUN_ID` below for a named one. */
export class NotFoundError extends Error {
  constructor(id: string) {
    super(`No run with id "${id}".`)
    this.name = 'NotFoundError'
  }
}

/** Content rules, "Empty and error states": "Could not load this run. The connection timed
 * out. Retry." — the default message matches that example. */
export class NetworkError extends Error {
  constructor(message = 'The connection timed out.') {
    super(message)
    this.name = 'NetworkError'
  }
}

/** Scenario S5: someone else decided while this reviewer was reading. Carries the decision
 * that already exists, so the caller can show who, when, and what — not just that it failed. */
export class DecisionConflictError extends Error {
  readonly currentDecision: Decision

  constructor(runId: string, currentDecision: Decision) {
    super(`Run "${runId}" was already decided by ${currentDecision.by}.`)
    this.name = 'DecisionConflictError'
    this.currentDecision = currentDecision
  }
}

/** Content rules, "Buttons": request changes and reject require a non-empty written reason. */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/** Deliberately absent from every fixture, so `getRun` always rejects with `NotFoundError`. */
export const NOT_FOUND_RUN_ID = 'run-does-not-exist'

export interface GetRunOptions {
  /** Overrides the default artificial delay, in ms. Pass a large value to hold a story or
   * test in its loading state on purpose. */
  delayMs?: number
  /** Throws `NetworkError` instead of completing, to test failure handling — see Content
   * rules, "Empty and error states": "Could not load this run. The connection timed out.
   * Retry." Mirrors `SubmitDecisionOptions.simulateNetworkError` below. */
  simulateNetworkError?: boolean
}

export async function getRun(id: string, options: GetRunOptions = {}): Promise<Run> {
  await delay(options.delayMs ?? DEFAULT_DELAY_MS)

  if (options.simulateNetworkError) throw new NetworkError()

  const run = store[id]
  if (!run) throw new NotFoundError(id)

  return structuredClone(run)
}

export interface SubmitDecisionOptions {
  delayMs?: number
  /** Throws `NetworkError` instead of completing, to test failure handling. */
  simulateNetworkError?: boolean
  /** Throws `DecisionConflictError` as if someone else decided first, even for a run that has
   * no decision yet. A run that already has one behaves this way regardless of this flag. */
  simulateConflict?: boolean
}

export async function submitDecision(
  runId: string,
  decision: DecisionInput,
  options: SubmitDecisionOptions = {},
): Promise<Run> {
  await delay(options.delayMs ?? DEFAULT_DELAY_MS)

  const run = store[runId]
  if (!run) throw new NotFoundError(runId)

  if (options.simulateNetworkError) throw new NetworkError()

  if (run.decision) throw new DecisionConflictError(runId, run.decision)
  if (options.simulateConflict) {
    throw new DecisionConflictError(runId, fabricateConflictingDecision())
  }

  if (
    (decision.outcome === 'changes_requested' || decision.outcome === 'rejected') &&
    !decision.reason?.trim()
  ) {
    const action = decision.outcome === 'rejected' ? 'reject' : 'request changes on'
    throw new ValidationError(`A written reason is required to ${action} a run.`)
  }

  const updated: Run = {
    ...run,
    status: decision.outcome,
    decision: {
      outcome: decision.outcome,
      by: decision.by,
      // Set here, not taken from the input — a client should not get to say when its own
      // request happened. See docs/DECISIONS.md, 0004.
      at: new Date().toISOString(),
      reason: decision.reason,
      acknowledgedGateIds: decision.acknowledgedGateIds,
      revision: decision.revision,
    },
  }

  store[runId] = updated
  return structuredClone(updated)
}

function fabricateConflictingDecision(): Decision {
  return {
    outcome: 'approved',
    by: 'A different reviewer (simulated)',
    at: new Date().toISOString(),
    acknowledgedGateIds: [],
    revision: 'simulated',
  }
}
