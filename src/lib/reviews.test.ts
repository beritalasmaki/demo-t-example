import { describe, expect, it } from 'vitest'
import { runBlocked, runClean, runMessy, runMessyPending } from '../fixtures'
import {
  archiveState,
  buildReportCsv,
  countByTab,
  formatArchivesIn,
  inTimeRange,
  matchesQuery,
  openItemCount,
  reportRecord,
  requesters,
  reviewStage,
  reviewStatus,
  sortRuns,
  updatedAt,
} from './reviews'
import type { Run } from './types'

const NOW = new Date(2026, 8, 24, 12, 0) // Thursday 24 September 2026, local time

/** runMessy, decided at a chosen moment, with a chosen outcome. */
function decided(at: Date, outcome: 'approved' | 'rejected' = 'approved'): Run {
  return {
    ...runMessy,
    id: `run-decided-${at.getTime()}`,
    status: outcome,
    decision: { ...runMessy.decision!, outcome, at: at.toISOString() },
  }
}

describe('reviewStatus and reviewStage', () => {
  it('maps run statuses to the four run types', () => {
    expect(reviewStatus(runMessyPending)).toBe('pending')
    expect(reviewStatus(runMessy)).toBe('approved')
    expect(reviewStatus({ ...runClean, status: 'rejected' })).toBe('declined')
    expect(reviewStatus({ ...runClean, status: 'changes_requested' })).toBe('requested')
  })

  it('puts a finished, undecided run at "needs review", a running one at "agent"', () => {
    expect(reviewStage(runMessyPending)).toBe('review')
    expect(reviewStage({ ...runClean, status: 'running' })).toBe('agent')
    expect(reviewStage(runMessy)).toBeNull()
  })
})

describe('openItemCount and updatedAt', () => {
  it('counts what is open, what an approval accepted, and nothing while running', () => {
    expect(openItemCount(runMessyPending)).toBe(3)
    expect(openItemCount(runClean)).toBe(0)
    expect(openItemCount(runMessy)).toBe(runMessy.decision!.acknowledgedItemIds.length)
    expect(openItemCount({ ...runClean, status: 'running' })).toBeNull()
  })

  it('uses the decision time, else the end of the run', () => {
    expect(updatedAt(runMessy)).toBe(runMessy.decision!.at)
    expect(updatedAt(runClean)).toBe(runClean.finishedAt)
  })
})

describe('archiveState', () => {
  it('keeps a finished run in My reviews for six months, then archives it by the rule', () => {
    const recent = decided(new Date(2026, 5, 1))
    expect(archiveState(recent, {}, NOW)).toMatchObject({ archived: false })
    expect(formatArchivesIn(archiveState(recent, {}, NOW).autoAt!, NOW)).toBe(
      'Archives in 2 months',
    )

    const old = decided(new Date(2026, 0, 10))
    expect(archiveState(old, {}, NOW)).toMatchObject({
      archived: true,
      by: 'auto',
      canRestore: false,
    })
  })

  it('archives by hand, and allows a restore for seven days only', () => {
    const run = decided(new Date(2026, 8, 1))
    const threeDaysAgo = new Date(2026, 8, 21, 12).toISOString()
    expect(archiveState(run, { [run.id]: threeDaysAgo }, NOW)).toMatchObject({
      archived: true,
      by: 'you',
      canRestore: true,
      restoreDaysLeft: 4,
    })
    const tenDaysAgo = new Date(2026, 8, 14, 12).toISOString()
    expect(archiveState(run, { [run.id]: tenDaysAgo }, NOW)).toMatchObject({ canRestore: false })
  })

  it('counts a restore window of exactly seven days from the moment of archiving', () => {
    const run = decided(new Date(2026, 8, 1))
    const justAfterNow = new Date(NOW.getTime() + 1000).toISOString()
    expect(archiveState(run, { [run.id]: justAfterNow }, NOW).restoreDaysLeft).toBe(7)
  })

  it('never archives a run that is not finished', () => {
    expect(archiveState(runMessyPending, { [runMessyPending.id]: NOW.toISOString() }, NOW)).toEqual(
      { archived: false, canRestore: false, restoreDaysLeft: 0 },
    )
  })
})

describe('search and filters', () => {
  it('searches the name, reference, service and requester', () => {
    expect(matchesQuery(runMessyPending, 'refund')).toBe(true)
    expect(matchesQuery(runMessyPending, 'RUN-MESSY')).toBe(true)
    expect(matchesQuery(runMessyPending, 'payments-service')).toBe(true)
    expect(matchesQuery(runMessyPending, 'maarit')).toBe(true)
    expect(matchesQuery(runMessyPending, 'booking')).toBe(false)
  })

  it('reads time ranges as calendar days, weeks starting on Monday', () => {
    const iso = (y: number, m: number, d: number) => new Date(y, m, d, 9).toISOString()
    expect(inTimeRange(iso(2026, 8, 21), 'thisWeek', NOW)).toBe(true) // Monday
    expect(inTimeRange(iso(2026, 8, 20), 'thisWeek', NOW)).toBe(false) // Sunday
    expect(inTimeRange(iso(2026, 8, 20), 'lastWeek', NOW)).toBe(true)
    expect(inTimeRange(iso(2026, 8, 1), 'thisMonth', NOW)).toBe(true)
    expect(inTimeRange(iso(2026, 2, 6), 'thisYear', NOW)).toBe(true)
    expect(
      inTimeRange(iso(2026, 8, 5), 'custom', NOW, { from: '2026-09-01', to: '2026-09-10' }),
    ).toBe(true)
    expect(
      inTimeRange(iso(2026, 8, 11), 'custom', NOW, { from: '2026-09-01', to: '2026-09-10' }),
    ).toBe(false)
  })

  it('lists requesters A to Z, once each, and counts runs per tab', () => {
    const runs = [runMessyPending, runMessy, runClean, runBlocked]
    expect(requesters(runs)).toEqual(['Elina Koskivaara', 'Maarit Kasakallio', 'Tuomas Rantanen'])
    expect(countByTab(runs)).toEqual({ all: 4, pending: 3, requested: 0, declined: 0, approved: 1 })
  })
})

describe('sortRuns', () => {
  const runs = [runMessy, runClean, runMessyPending, runBlocked]

  it('puts runs that need review first when ordered by "updated"', () => {
    const sorted = sortRuns(runs, 'updated', 'desc').map(reviewStage)
    expect(sorted).toEqual(['review', 'review', 'review', null])
  })

  it('orders by name either way', () => {
    const names = sortRuns(runs, 'run', 'asc').map((run) => run.initiative)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
    expect(sortRuns(runs, 'run', 'desc')[0].initiative).toBe(names[names.length - 1])
  })

  it('orders by open items, most first', () => {
    const counts = sortRuns(runs, 'open', 'desc').map((run) => openItemCount(run) ?? -1)
    expect(counts).toEqual([...counts].sort((a, b) => b - a))
  })
})

describe('reports', () => {
  const all = { decision: true, open: true, checks: true, steps: false }

  it('records a run from its own data', () => {
    const record = reportRecord(runMessy, all)
    expect(record).toMatchObject({
      reference: 'run-messy',
      status: 'Approved',
      service: 'payments-service',
    })
    expect(record.decision?.by).toBe(runMessy.decision!.by)
    expect(record.openItems?.some((item) => item.accepted)).toBe(true)
    expect(record.checks).toHaveLength(runMessy.gates.length)
    expect(record.steps).toBeUndefined()
  })

  it('writes CSV with quoting, and one tagged row per step when asked', () => {
    const rows = parseCsv(buildReportCsv([runMessy], { ...all, steps: true }))
    expect(rows[0].join(',')).toBe(
      'Row,Run,Reference,Service,Environment,Status,Requested by,Decision,Decided by,Decided at,Reason,Open items,Checks,Confidence,Step time,Step type,Step',
    )
    expect(rows.every((row) => row.length === 17)).toBe(true)
    expect(rows[1][0]).toBe('run')
    expect(rows[1][10]).toBe(runMessy.decision!.reason)
    expect(rows.filter((row) => row[0] === 'step')).toHaveLength(runMessy.timeline.length)
  })
})

/** Just enough of an RFC 4180 reader to check the writer: quoted cells may hold commas,
 * doubled quotes and line breaks. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (char === '"') quoted = false
      else cell += char
    } else if (char === '"') quoted = true
    else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += char
  }
  return rows
}
