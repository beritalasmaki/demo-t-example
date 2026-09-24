import { runs as seedRuns } from '../fixtures'
import { isStillRunning, undoWindow } from './decision'
import { approvalNeedsReason } from './openItems'
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

// A mutable copy, so a decision persists across calls without mutating the fixtures themselves.
// Every link in the app is a full page load (there is no router), so the decisions made here are
// also kept in sessionStorage and laid back over the fixtures on load: a run declined on its page
// is still declined in My reviews, and until the tab is closed (docs/DECISIONS.md, 0064).
const store: Record<string, Run> = { ...seedRuns }

/** runId → the decision made in this tab, or `null` for a fixture's decision that was undone. */
export const DECISIONS_STORAGE_KEY = 'ledger:decisions'
type DecisionLog = Record<string, Decision | null>

function readDecisionLog(): DecisionLog {
  try {
    const raw = window.sessionStorage.getItem(DECISIONS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as DecisionLog) : {}
  } catch {
    return {}
  }
}

function logDecision(runId: string, decision: Decision | null) {
  try {
    const log = readDecisionLog()
    log[runId] = decision
    window.sessionStorage.setItem(DECISIONS_STORAGE_KEY, JSON.stringify(log))
  } catch {
    // No storage (a private window, blocked site data): decisions last until the next load.
  }
}

function withDecision(run: Run, decision: Decision | null): Run {
  return decision
    ? { ...run, status: decision.outcome, decision }
    : { ...run, status: 'awaiting_review', decision: undefined }
}

for (const [runId, decision] of Object.entries(readDecisionLog())) {
  const run = store[runId]
  if (run) store[runId] = withDecision(run, decision)
}

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

/** Every run assigned to the reviewer, in full, for "My reviews": its tabs, open-item counts,
 * decision details and reports all read the run's own data (docs/DECISIONS.md, 0060). */
export async function listRuns(options: GetRunOptions = {}): Promise<Run[]> {
  await delay(options.delayMs ?? DEFAULT_DELAY_MS)
  if (options.simulateNetworkError) throw new NetworkError()
  return Object.values(store).map((run) => structuredClone(run))
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

  if (isStillRunning(run)) {
    throw new ValidationError(
      'This run is still running. It can be decided once its checks have finished.',
    )
  }
  if (
    (decision.outcome === 'changes_requested' || decision.outcome === 'rejected') &&
    !decision.reason?.trim()
  ) {
    const action = decision.outcome === 'rejected' ? 'reject' : 'request changes on'
    throw new ValidationError(`A written reason is required to ${action} a run.`)
  }
  if (decision.outcome === 'approved' && approvalNeedsReason(run) && !decision.reason?.trim()) {
    throw new ValidationError(
      'A written reason is required to approve a run with checks that failed or did not run.',
    )
  }

  const recorded: Decision = {
    outcome: decision.outcome,
    by: decision.by,
    // Set here, not taken from the input — a client should not get to say when its own
    // request happened. See docs/DECISIONS.md, 0004.
    at: new Date().toISOString(),
    reason: decision.reason,
    acknowledgedItemIds: decision.acknowledgedItemIds,
    revision: decision.revision,
  }
  const updated = withDecision(run, recorded)

  store[runId] = updated
  logDecision(runId, recorded)
  return structuredClone(updated)
}

/** Thrown by `undoDecision` when there is nothing to undo, or the 10-minute window has closed. */
export class UndoClosedError extends Error {
  constructor(runId: string) {
    super(`The decision on run "${runId}" can no longer be undone.`)
    this.name = 'UndoClosedError'
  }
}

/**
 * Takes a decision back inside its undo window (docs/DECISIONS.md, 0003), here as well as on
 * screen: the run is awaiting review again, so the next decision on it is recorded rather than
 * refused as a conflict with the one that was undone (0064).
 */
export async function undoDecision(
  runId: string,
  options: SubmitDecisionOptions = {},
): Promise<Run> {
  await delay(options.delayMs ?? DEFAULT_DELAY_MS)

  const run = store[runId]
  if (!run) throw new NotFoundError(runId)

  if (options.simulateNetworkError) throw new NetworkError()

  if (!run.decision || !undoWindow(run.decision).active) throw new UndoClosedError(runId)

  const updated = withDecision(run, null)
  store[runId] = updated
  logDecision(runId, null)
  return structuredClone(updated)
}

function fabricateConflictingDecision(): Decision {
  return {
    outcome: 'approved',
    by: 'A different reviewer (simulated)',
    at: new Date().toISOString(),
    acknowledgedItemIds: [],
    revision: 'simulated',
  }
}
