import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Decision, Run } from '../../lib/types'
import { DecisionDialog } from './DecisionDialog'

const baseProps = {
  runId: 'run-clean',
  revision: 'f3a9c2',
  environment: 'staging' as Run['target']['environment'],
  reviewerName: 'Jordan Ellis',
  acknowledgedGateIds: [],
  onClose: vi.fn(),
  onDecided: vi.fn(),
  onConflict: vi.fn(),
}

describe('DecisionDialog', () => {
  it('states the approve confirmation with the real revision, environment and undo length', () => {
    render(<DecisionDialog {...baseProps} action="approved" />)
    expect(
      screen.getByText('Release revision f3a9c2 to staging? You can undo this for 10 minutes.'),
    ).toBeVisible()
  })

  it('asks "What should change?" for request changes, and blocks submit until a reason is typed', async () => {
    const user = userEvent.setup()
    render(<DecisionDialog {...baseProps} action="changes_requested" />)

    expect(screen.getByText('What should change?')).toBeVisible()
    const submit = screen.getByRole('button', { name: 'Request changes' })
    expect(submit).toBeDisabled()

    await user.type(screen.getByRole('textbox'), 'Please add a test for the empty case.')
    expect(submit).toBeEnabled()
  })

  it('asks "Why is this rejected?" for reject, and blocks submit until a reason is typed', async () => {
    const user = userEvent.setup()
    render(<DecisionDialog {...baseProps} action="rejected" />)

    expect(screen.getByText('Why is this rejected?')).toBeVisible()
    const submit = screen.getByRole('button', { name: 'Reject run' })
    expect(submit).toBeDisabled()

    await user.type(screen.getByRole('textbox'), '   ')
    expect(submit).toBeDisabled()

    await user.type(screen.getByRole('textbox'), 'Not ready.')
    expect(submit).toBeEnabled()
  })

  it('Cancel closes without submitting anything', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onDecided = vi.fn()
    render(
      <DecisionDialog {...baseProps} action="approved" onClose={onClose} onDecided={onDecided} />,
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onDecided).not.toHaveBeenCalled()
  })

  it('submits a real decision and reports the updated run back', async () => {
    const user = userEvent.setup()
    const onDecided = vi.fn()
    render(
      <DecisionDialog
        {...baseProps}
        action="changes_requested"
        onDecided={onDecided}
        submitDecisionOptions={{ delayMs: 0 }}
      />,
    )

    await user.type(screen.getByRole('textbox'), 'Please add a test for the empty case.')
    await user.click(screen.getByRole('button', { name: 'Request changes' }))

    await waitFor(() => expect(onDecided).toHaveBeenCalledTimes(1))
    const updated = onDecided.mock.calls[0][0] as Run
    expect(updated.status).toBe('changes_requested')
    expect(updated.decision?.by).toBe('Jordan Ellis')
    expect(updated.decision?.reason).toBe('Please add a test for the empty case.')
  })

  it('shows the Content rules failed-submit message on a network error, keeping the typed reason', async () => {
    const user = userEvent.setup()
    render(
      <DecisionDialog
        {...baseProps}
        runId="run-blocked"
        action="rejected"
        submitDecisionOptions={{ delayMs: 0, simulateNetworkError: true }}
      />,
    )

    await user.type(screen.getByRole('textbox'), 'Not ready for release.')
    await user.click(screen.getByRole('button', { name: 'Reject run' }))

    expect(
      await screen.findByText('Could not submit this decision. The connection timed out.'),
    ).toBeVisible()
    expect(screen.getByRole('textbox')).toHaveValue('Not ready for release.')
  })

  it('shows who decided, when, and preserves the reason on a conflict', async () => {
    const user = userEvent.setup()
    const onConflict = vi.fn()
    render(
      <DecisionDialog
        {...baseProps}
        runId="run-blocked"
        action="rejected"
        onConflict={onConflict}
        submitDecisionOptions={{ delayMs: 0, simulateConflict: true }}
      />,
    )

    await user.type(screen.getByRole('textbox'), 'Not ready for release.')
    await user.click(screen.getByRole('button', { name: 'Reject run' }))

    // "Approved" and the reviewer's name live in separate DOM text nodes (the outcome label
    // is inside its own <span>), so each is checked on its own rather than as one string.
    expect(await screen.findByText('Approved')).toBeVisible()
    expect(screen.getByText(/A different reviewer \(simulated\)/)).toBeVisible()
    expect(screen.getByText('Not ready for release.')).toBeVisible()
    expect(onConflict).toHaveBeenCalledTimes(1)
    const currentDecision = onConflict.mock.calls[0][0] as Decision
    expect(currentDecision.outcome).toBe('approved')

    // The original form is gone — nothing left to resubmit or accidentally double-apply.
    expect(screen.queryByRole('button', { name: 'Reject run' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeVisible()
  })

  it('can render the error state directly, for stories and tests', () => {
    render(
      <DecisionDialog
        {...baseProps}
        action="approved"
        initialState={{ status: 'error', message: 'The connection timed out.' }}
      />,
    )
    expect(
      screen.getByText('Could not submit this decision. The connection timed out.'),
    ).toBeVisible()
  })
})
