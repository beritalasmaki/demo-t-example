import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { runBlocked, runMessy, runMessyPending } from '../../fixtures'
import { RunDetails } from './RunDetails'

describe('RunDetails', () => {
  it('groups the facts under "The change" and "The run"', () => {
    render(<RunDetails run={runMessyPending} />)
    const change = screen.getByRole('region', { name: 'The change' })
    expect(within(change).getByText('payments-service')).toBeVisible()
    expect(within(change).getByText('production')).toBeVisible()
    expect(within(change).getByText('The live system. Real customers use it.')).toBeVisible()
    expect(within(change).getByText('e91a4c')).toBeVisible()
    expect(within(change).getByText('run-messy-pending')).toBeVisible()
    expect(within(change).getByText('Quote this to find the review again later.')).toBeVisible()

    const theRun = screen.getByRole('region', { name: 'The run' })
    expect(within(theRun).getByText('Maarit Kasakallio')).toBeVisible()
    expect(within(theRun).getByText('Kestrel 4.3.0')).toBeVisible()
    expect(within(theRun).getByText('1 h 49 min')).toBeVisible()
    expect(within(theRun).getByText('· 2 not run')).toBeVisible()
    expect(within(theRun).getByText('52%')).toBeVisible()
  })

  it('shows a failed check and an exception', () => {
    render(<RunDetails run={runBlocked} />)
    expect(screen.getByText('· 1 failed')).toBeVisible()
    expect(screen.getByText('1 exception · 1 does not apply')).toBeVisible()
  })

  it('uses past tense once released', () => {
    render(<RunDetails run={runMessy} />)
    expect(screen.getByText('Where it went')).toBeVisible()
    expect(screen.getByText('What was released')).toBeVisible()
  })
})
