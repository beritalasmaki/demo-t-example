import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { NOT_FOUND_RUN_ID } from '../../lib/api'
import { runClean, runMessy, runMessyPending } from '../../fixtures'
import { RunReviewPage } from './RunReviewPage'

describe('RunReviewPage', () => {
  it('shows a loading state before the run arrives', () => {
    render(<RunReviewPage runId={runClean.id} getRunOptions={{ delayMs: 20 }} />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading run')
  })

  it('opens on the story, with the decision panel and what is not checked beside it', async () => {
    render(<RunReviewPage runId={runMessyPending.id} getRunOptions={{ delayMs: 0 }} />)

    expect(
      await screen.findByRole('heading', { level: 1, name: runMessyPending.initiative }),
    ).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Story', selected: true })).toBeVisible()
    expect(screen.getByRole('region', { name: 'What happened, in order' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Your decision' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'What is not checked' })).toBeVisible()
    expect(screen.getByText('3 things are open')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Approve and release' })).toBeDisabled()
  })

  it('switches views with the tabs, keeping the decision panel', async () => {
    const user = userEvent.setup()
    render(<RunReviewPage runId={runMessyPending.id} getRunOptions={{ delayMs: 0 }} />)
    await screen.findByRole('heading', { level: 1 })

    await user.click(screen.getByRole('tab', { name: 'Evidence' }))
    expect(screen.getByRole('region', { name: 'Evidence' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Your decision' })).toBeVisible()

    await user.click(screen.getByRole('tab', { name: 'All 200 steps' }))
    expect(screen.getByRole('region', { name: 'All 200 steps' })).toBeVisible()
  })

  it('shows the details by default, and the top bar stays in place while scrolling', async () => {
    render(<RunReviewPage runId={runMessyPending.id} getRunOptions={{ delayMs: 0 }} />)
    await screen.findByRole('heading', { level: 1 })
    expect(screen.getByText('Why the agent was asked')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Hide details', expanded: true })).toBeVisible()
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' }).closest('.sticky')).not.toBeNull()
  })

  it('choosing a tab moves focus to that view, and hides the details until asked', async () => {
    const user = userEvent.setup()
    render(<RunReviewPage runId={runMessyPending.id} getRunOptions={{ delayMs: 0 }} />)
    await screen.findByRole('heading', { level: 1 })

    await user.click(screen.getByRole('tab', { name: 'Evidence' }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2, name: 'Evidence' })).toHaveFocus(),
    )
    expect(screen.queryByText('Why the agent was asked')).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Story' }))
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 2, name: 'What happened, in order' }),
      ).toHaveFocus(),
    )
    expect(screen.queryByText('Why the agent was asked')).not.toBeInTheDocument()
    // The compact row still carries what must never be hidden.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(runMessyPending.initiative)
    expect(screen.getByRole('link', { name: '3 open items' })).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Show details', expanded: false }))
    expect(screen.getByText('Why the agent was asked')).toBeVisible()
  })

  it('keeps the details open on a decided run while it can still be undone', async () => {
    const user = userEvent.setup()
    render(<RunReviewPage runId={runMessy.id} getRunOptions={{ delayMs: 0 }} />)
    await screen.findByRole('heading', { level: 1 })

    await user.click(screen.getByRole('tab', { name: 'Evidence' }))
    expect(screen.getByRole('button', { name: 'Undo this decision' })).toBeVisible()
    expect(screen.queryByRole('button', { name: /details/ })).not.toBeInTheDocument()
  })

  it('arrow keys move along the tabs without switching; Enter switches and moves focus', async () => {
    const user = userEvent.setup()
    render(<RunReviewPage runId={runMessyPending.id} getRunOptions={{ delayMs: 0 }} />)
    await screen.findByRole('heading', { level: 1 })

    screen.getByRole('tab', { name: 'Story' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Evidence' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'Story', selected: true })).toBeVisible()

    await user.keyboard('{Enter}')
    expect(screen.getByRole('tab', { name: 'Evidence', selected: true })).toBeVisible()
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2, name: 'Evidence' })).toHaveFocus(),
    )
  })

  it('"Show all 180 steps" opens the step list with the shard group expanded', async () => {
    const user = userEvent.setup()
    render(<RunReviewPage runId={runMessyPending.id} getRunOptions={{ delayMs: 0 }} />)
    await screen.findByRole('heading', { level: 1 })

    await user.click(screen.getByRole('button', { name: 'Show all 180 steps' }))

    expect(screen.getByRole('tab', { name: 'All 200 steps', selected: true })).toBeVisible()
    expect(screen.getByRole('button', { name: /180 similar steps/, expanded: true })).toBeVisible()
    expect(screen.getByText('Checked the gateway config for shard-180.')).toBeVisible()
  })

  it('shows an approved run as a record: undo window, what is still unverified, run shape', async () => {
    render(<RunReviewPage runId={runMessy.id} getRunOptions={{ delayMs: 0 }} />)
    await screen.findByRole('heading', { level: 1 })

    expect(screen.getByText('Undo window open')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Undo this decision' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'What is still unverified' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Run shape' })).toBeVisible()
    expect(screen.queryByRole('region', { name: 'Your decision' })).not.toBeInTheDocument()
    expect(screen.getByText(/Their reason:/)).toBeVisible()
  })

  it('reflects a decision immediately, without a refetch, and undo brings the panel back', async () => {
    const user = userEvent.setup()
    render(
      <RunReviewPage
        runId={runClean.id}
        getRunOptions={{ delayMs: 0 }}
        submitDecisionOptions={{ delayMs: 0 }}
      />,
    )
    await screen.findByRole('heading', { level: 1 })
    await user.click(screen.getByRole('tab', { name: 'Evidence' }))
    expect(screen.getByRole('button', { name: 'Show details' })).toBeVisible()

    // Nothing is open on the clean run, so approving needs no tick and no reason.
    await user.click(screen.getByRole('button', { name: 'Approve and release' }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Approve and release' }))

    expect(await screen.findByText('Undo window open')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Approve and release' })).not.toBeInTheDocument()
    // Deciding opens the details, so the undo window is on screen, with no way to hide it.
    expect(screen.queryByRole('button', { name: /details/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Undo this decision' }))
    expect(screen.getByRole('region', { name: 'Your decision' })).toBeVisible()
  })

  it('shows a plain not-found message for an id with no matching run', async () => {
    render(<RunReviewPage runId={NOT_FOUND_RUN_ID} getRunOptions={{ delayMs: 0 }} />)
    expect(
      await screen.findByText(`Could not find a run with id "${NOT_FOUND_RUN_ID}".`, {
        exact: false,
      }),
    ).toBeVisible()
    expect(screen.getByRole('link', { name: 'Back to my reviews' })).toBeVisible()
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
    expect(screen.getByRole('status')).toHaveTextContent('Loading run')
  })
})
