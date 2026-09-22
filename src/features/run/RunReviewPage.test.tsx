import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { NOT_FOUND_RUN_ID } from '../../lib/api'
import { runClean } from '../../fixtures'
import { RunReviewPage } from './RunReviewPage'

describe('RunReviewPage', () => {
  it('shows a loading state before the run arrives', () => {
    render(<RunReviewPage runId={runClean.id} getRunOptions={{ delayMs: 20 }} />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading run')
  })

  it('composes the header, summary, gates, timeline and decision bar once the run loads', async () => {
    render(<RunReviewPage runId={runClean.id} getRunOptions={{ delayMs: 0 }} />)

    expect(await screen.findByText(runClean.target.system)).toBeVisible()
    expect(screen.getByRole('region', { name: 'Summary' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Policy gates' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Audit log' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Decision' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Approve and release' })).toBeVisible()
  })

  it('reflects a decision immediately, without a refetch', async () => {
    const user = userEvent.setup()
    render(
      <RunReviewPage
        runId={runClean.id}
        getRunOptions={{ delayMs: 0 }}
        submitDecisionOptions={{ delayMs: 0 }}
      />,
    )

    await screen.findByText(runClean.target.system)
    await user.click(screen.getByRole('button', { name: 'Approve and release' }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Approve and release' }))

    const decisionRegion = screen.getByRole('region', { name: 'Decision' })
    expect(await within(decisionRegion).findByText('Approved by')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Approve and release' })).not.toBeInTheDocument()
  })

  it('shows a plain not-found message for an id with no matching run', async () => {
    render(<RunReviewPage runId={NOT_FOUND_RUN_ID} getRunOptions={{ delayMs: 0 }} />)
    expect(
      await screen.findByText(`Could not find a run with id "${NOT_FOUND_RUN_ID}".`),
    ).toBeVisible()
  })

  it('shows the Content rules failed-load message, with a Retry that re-triggers the load', async () => {
    const user = userEvent.setup()
    render(
      <RunReviewPage
        runId={runClean.id}
        getRunOptions={{ delayMs: 20, simulateNetworkError: true }}
      />,
    )

    expect(
      await screen.findByText(/^Could not load this run\. The connection timed out\./),
    ).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    // Retry re-runs the same (still-failing) load — proving the button calls back into
    // useRun's refetch. useRun.test.ts covers a retry that goes on to succeed.
    expect(screen.getByRole('status')).toHaveTextContent('Loading run')
  })
})
