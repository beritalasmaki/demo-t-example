import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DecisionConflictError,
  NetworkError,
  NOT_FOUND_RUN_ID,
  NotFoundError,
  UndoClosedError,
  ValidationError,
  getRun,
  listRuns,
  DECISIONS_STORAGE_KEY,
  submitDecision,
  undoDecision,
} from './api'
import type { DecisionInput } from './types'

afterEach(() => {
  vi.useRealTimers()
})

describe('getRun', () => {
  it('resolves a known id with its run', async () => {
    const run = await getRun('run-clean')
    expect(run.id).toBe('run-clean')
  })

  it('rejects an unknown id with NotFoundError', async () => {
    await expect(getRun(NOT_FOUND_RUN_ID)).rejects.toBeInstanceOf(NotFoundError)
  })

  it('holds the loading state for as long as a caller asks, for testing it on purpose', async () => {
    vi.useFakeTimers()
    let resolved = false
    const promise = getRun('run-clean', { delayMs: 5000 }).then((run) => {
      resolved = true
      return run
    })

    await vi.advanceTimersByTimeAsync(4999)
    expect(resolved).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    await promise
    expect(resolved).toBe(true)
  })

  it('lists every run for the "My reviews" page', async () => {
    const list = await listRuns({ delayMs: 0 })
    expect(list.map((item) => item.id)).toContain('run-messy-pending')
    expect(list.find((item) => item.id === 'run-clean')?.target.system).toBe('patient-portal')
  })

  it('lists copies, not live references into the store', async () => {
    const list = await listRuns({ delayMs: 0 })
    list[0].initiative = 'tampered'
    const again = await listRuns({ delayMs: 0 })
    expect(again[0].initiative).not.toBe('tampered')
  })

  it('returns a copy, not a live reference into the store', async () => {
    const run = await getRun('run-clean')
    run.initiative = 'tampered'
    const runAgain = await getRun('run-clean')
    expect(runAgain.initiative).not.toBe('tampered')
  })
})

describe('submitDecision', () => {
  const approveRunBlocked: DecisionInput = {
    outcome: 'approved',
    by: 'A reviewer',
    reason: 'The retention fix ships separately today.',
    acknowledgedItemIds: ['open-gates-fail', 'open-gates-waived'],
    revision: 'a1b2c3',
  }

  it('records who and when, sets status, and persists for the next getRun', async () => {
    const updated = await submitDecision('run-blocked', approveRunBlocked)

    expect(updated.status).toBe('approved')
    expect(updated.decision?.by).toBe('A reviewer')
    expect(updated.decision?.acknowledgedItemIds).toEqual(['open-gates-fail', 'open-gates-waived'])
    expect(updated.decision?.reason).toBe('The retention fix ships separately today.')
    // Set by api.ts, not taken from the input (docs/DECISIONS.md, 0004).
    expect(new Date(updated.decision!.at).getTime()).not.toBeNaN()

    const fetchedAgain = await getRun('run-blocked')
    expect(fetchedAgain.decision?.by).toBe('A reviewer')
  })

  it('rejects an unknown id with NotFoundError', async () => {
    await expect(submitDecision(NOT_FOUND_RUN_ID, approveRunBlocked)).rejects.toBeInstanceOf(
      NotFoundError,
    )
  })

  it('simulates a network failure on request', async () => {
    await expect(
      submitDecision('run-clean', approveRunBlocked, { simulateNetworkError: true }),
    ).rejects.toBeInstanceOf(NetworkError)
  })

  it('rejects with the real recorded decision when a run was already decided', async () => {
    const error = await submitDecision('run-messy', approveRunBlocked).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(DecisionConflictError)
    expect((error as DecisionConflictError).currentDecision.by).toBe('Juhani Virtaleppäsoutu')
  })

  it('can simulate a conflict even for a run with no decision yet', async () => {
    const error = await submitDecision('run-clean', approveRunBlocked, {
      simulateConflict: true,
    }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(DecisionConflictError)
    expect((error as DecisionConflictError).currentDecision.by).toBeTruthy()
  })

  it('requires a written reason to request changes', async () => {
    await expect(
      submitDecision('run-clean', {
        outcome: 'changes_requested',
        by: 'A reviewer',
        acknowledgedItemIds: [],
        revision: 'a1b2c3',
      }),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('requires a written reason to reject', async () => {
    await expect(
      submitDecision('run-clean', {
        outcome: 'rejected',
        by: 'A reviewer',
        reason: '   ',
        acknowledgedItemIds: [],
        revision: 'a1b2c3',
      }),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('requires a written reason to approve a run with a check that did not run', async () => {
    const error = await submitDecision('run-messy-pending', {
      outcome: 'approved',
      by: 'A reviewer',
      acknowledgedItemIds: [],
      revision: 'e91a4c',
    }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ValidationError)
    expect((error as ValidationError).message).toMatch(/did not run/)
  })

  // Approving with no `reason` at all, and having it succeed, is already covered by
  // "records who and when..." above — a separate test here would be the only other test in
  // this file to actually leave `run-clean` decided, which would make the two tests above
  // depend on running before it.
})

describe('submitDecision on a run that is still running', () => {
  it('refuses: there is nothing final to decide on yet', async () => {
    const error = await submitDecision(
      'run-sms-provider',
      {
        outcome: 'rejected',
        by: 'A reviewer',
        reason: 'No.',
        acknowledgedItemIds: [],
        revision: 'r',
      },
      { delayMs: 0 },
    ).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ValidationError)
    expect((error as ValidationError).message).toMatch(/still running/)
  })
})

describe('undoDecision', () => {
  const reject: DecisionInput = {
    outcome: 'rejected',
    by: 'A reviewer',
    reason: 'Wrong rates.',
    acknowledgedItemIds: [],
    revision: 'r1',
  }

  it('takes the decision back, so the next one is recorded instead of a conflict', async () => {
    await submitDecision('run-vat-estonia', reject, { delayMs: 0 })
    const undone = await undoDecision('run-vat-estonia', { delayMs: 0 })
    expect(undone.status).toBe('awaiting_review')
    expect(undone.decision).toBeUndefined()

    const redecided = await submitDecision(
      'run-vat-estonia',
      { ...reject, outcome: 'changes_requested', reason: 'Use the new rate table.' },
      { delayMs: 0 },
    )
    expect(redecided.status).toBe('changes_requested')
    expect((await getRun('run-vat-estonia', { delayMs: 0 })).decision?.outcome).toBe(
      'changes_requested',
    )
  })

  it('refuses when there is no decision, or its 10-minute window has closed', async () => {
    await expect(undoDecision('run-clean', { delayMs: 0 })).rejects.toBeInstanceOf(UndoClosedError)
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(Date.now() + 11 * 60_000)
    await expect(undoDecision('run-messy', { delayMs: 0 })).rejects.toBeInstanceOf(UndoClosedError)
  })
})

describe('decisions across page loads', () => {
  it('keeps a decision for the tab, and lays it back over the fixtures on the next load', async () => {
    await submitDecision(
      'run-session-timeout',
      {
        outcome: 'rejected',
        by: 'A reviewer',
        reason: 'No.',
        acknowledgedItemIds: [],
        revision: 'r',
      },
      { delayMs: 0 },
    )
    expect(JSON.parse(window.sessionStorage.getItem(DECISIONS_STORAGE_KEY) ?? '{}')).toMatchObject({
      'run-session-timeout': { outcome: 'rejected' },
    })

    vi.resetModules()
    const reloaded = await import('./api')
    const run = await reloaded.getRun('run-session-timeout', { delayMs: 0 })
    expect(run.status).toBe('rejected')
    expect(run.decision?.reason).toBe('No.')
  })

  it('reads a fixture decision that was undone as awaiting review', async () => {
    window.sessionStorage.setItem(DECISIONS_STORAGE_KEY, JSON.stringify({ 'run-messy': null }))
    vi.resetModules()
    const reloaded = await import('./api')
    const run = await reloaded.getRun('run-messy', { delayMs: 0 })
    expect(run.status).toBe('awaiting_review')
    expect(run.decision).toBeUndefined()
  })
})
