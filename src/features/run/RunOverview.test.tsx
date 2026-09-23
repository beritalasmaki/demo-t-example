import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { runBlocked, runClean, runMessy, runMessyPending } from '../../fixtures'
import { RunOverview } from './RunOverview'

describe('RunOverview', () => {
  it('shows status, initiative, why the agent was asked and where the run is now', () => {
    render(<RunOverview run={runMessyPending} onRunUpdated={vi.fn()} />)
    expect(screen.getByText('Awaiting review')).toBeVisible()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(runMessyPending.initiative)
    expect(screen.getByText('Why the agent was asked')).toBeVisible()
    // Once in the assignment sentence, once as the requester.
    expect(screen.getAllByText('Maarit Kasakallio')).toHaveLength(2)
    expect(
      screen.getByText(/Nothing has been released\. The agent worked for 1 h 49 min/),
    ).toBeVisible()
  })

  it('names production in text, with what the word means, and every id with its purpose', () => {
    render(<RunOverview run={runMessyPending} onRunUpdated={vi.fn()} />)
    expect(screen.getByText('production')).toBeVisible()
    expect(screen.getByText('The live system. Real customers use it.')).toBeVisible()
    expect(screen.getByText('Quote this to find the review again later.')).toBeVisible()
    expect(screen.getByText('run-messy-pending')).toBeVisible()
  })

  it('shows what is open, with a link to the tick list', () => {
    render(<RunOverview run={runMessyPending} onRunUpdated={vi.fn()} />)
    expect(screen.getByText('3 things are open')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Jump to the open items →' })).toHaveAttribute(
      'href',
      '#open-items',
    )
    expect(screen.getByText('4 passed', { exact: false })).toBeVisible()
    expect(screen.getByText('· 2 not run')).toBeVisible()
  })

  it('says so when nothing is open', () => {
    render(<RunOverview run={runClean} onRunUpdated={vi.fn()} />)
    expect(screen.getByText('Nothing is open')).toBeVisible()
  })

  it('shows a failed check and an exception in the checks field', () => {
    render(<RunOverview run={runBlocked} onRunUpdated={vi.fn()} />)
    expect(screen.getByText('· 1 failed')).toBeVisible()
    expect(screen.getByText('1 exception · 1 does not apply')).toBeVisible()
  })

  it('after an approval: who decided, the undo window, and "Where it went"', () => {
    render(<RunOverview run={runMessy} onRunUpdated={vi.fn()} />)
    expect(screen.getByText('Approved')).toBeVisible()
    expect(
      screen.getByText(/approved revision e91a4c for payments-service in production/),
    ).toBeVisible()
    expect(screen.getByText('Undo window open')).toBeVisible()
    expect(screen.getByText('Where it went')).toBeVisible()
  })
})
