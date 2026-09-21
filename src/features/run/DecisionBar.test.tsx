import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { runClean } from '../../fixtures'
import type { PolicyGate, Run } from '../../lib/types'
import { DecisionBar } from './DecisionBar'

function gate(overrides: Partial<PolicyGate> & Pick<PolicyGate, 'id' | 'result'>): PolicyGate {
  return {
    name: overrides.id,
    plainLanguage: '',
    evaluatedBy: 'policy-engine v2.3',
    evaluatedAt: '2026-01-01T00:00:00Z',
    evidenceIds: [],
    ...overrides,
  }
}

function run(overrides: Partial<Run> = {}): Run {
  return {
    id: 'test-run',
    initiative: 'Test initiative',
    requestedBy: 'Someone',
    revision: 'abc123',
    target: { system: 'test-service', environment: 'staging' },
    agent: { name: 'Kestrel', version: '1.0.0', model: 'kestrel-code' },
    startedAt: '2026-01-01T00:00:00Z',
    status: 'awaiting_review',
    summary: [],
    gates: [gate({ id: 'security', result: 'pass' })],
    timeline: [],
    confidence: [],
    ...overrides,
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('DecisionBar', () => {
  it('shows no sign-off tick and enables every action when no gate needs acknowledgement', () => {
    render(<DecisionBar run={run()} onRunUpdated={() => {}} />)
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve and release' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Request changes' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Reject run' })).toBeEnabled()
  })

  it('blocks Approve until the sign-off tick is checked, naming the real counts', async () => {
    const user = userEvent.setup()
    render(
      <DecisionBar
        run={run({ gates: [gate({ id: 'data-retention', result: 'fail' })] })}
        onRunUpdated={() => {}}
      />,
    )

    expect(screen.getByText('I have seen 1 failed check.')).toBeVisible()
    const approve = screen.getByRole('button', { name: 'Approve and release' })
    expect(approve).toBeDisabled()

    await user.click(screen.getByRole('checkbox'))
    expect(approve).toBeEnabled()
  })

  it('starts ticked when defaultAcknowledged is set, for stories and tests', () => {
    render(
      <DecisionBar
        run={run({ gates: [gate({ id: 'data-retention', result: 'fail' })] })}
        onRunUpdated={() => {}}
        defaultAcknowledged
      />,
    )
    expect(screen.getByRole('checkbox')).toBeChecked()
    expect(screen.getByRole('button', { name: 'Approve and release' })).toBeEnabled()
  })

  it('Request changes and Reject stay enabled regardless of an unticked sign-off', () => {
    render(
      <DecisionBar
        run={run({ gates: [gate({ id: 'data-retention', result: 'fail' })] })}
        onRunUpdated={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: 'Request changes' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Reject run' })).toBeEnabled()
  })

  it('opens the matching dialog for each action', async () => {
    const user = userEvent.setup()
    render(<DecisionBar run={run()} onRunUpdated={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Reject run' }))
    expect(screen.getByRole('heading', { name: 'Reject run' })).toBeVisible()
  })

  it('shows who decided, when, the revision, and a live undo countdown once decided', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-01-01T00:03:00Z'))
    render(
      <DecisionBar
        run={run({
          status: 'approved',
          decision: {
            outcome: 'approved',
            by: 'Jordan Ellis',
            at: '2026-01-01T00:00:00Z',
            acknowledgedGateIds: [],
            revision: 'abc123',
          },
        })}
        onRunUpdated={() => {}}
      />,
    )

    expect(screen.getByText('Approved')).toBeVisible()
    expect(screen.getByText(/Jordan Ellis/)).toBeVisible()
    expect(screen.getByText('Revision abc123')).toBeVisible()
    expect(screen.getByText('You can undo this for 7 min 0 s more.')).toBeVisible()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText('You can undo this for 6 min 59 s more.')).toBeVisible()
  })

  it('hides the undo line once the window has closed', () => {
    render(
      <DecisionBar
        run={run({
          status: 'approved',
          decision: {
            outcome: 'approved',
            by: 'Jordan Ellis',
            at: '2020-01-01T00:00:00Z',
            acknowledgedGateIds: [],
            revision: 'abc123',
          },
        })}
        onRunUpdated={() => {}}
      />,
    )
    expect(screen.queryByText(/You can undo this/)).not.toBeInTheDocument()
  })

  it('completes a real approve round trip and reports the updated run', async () => {
    const user = userEvent.setup()
    const onRunUpdated = vi.fn()
    render(
      <DecisionBar
        run={runClean}
        onRunUpdated={onRunUpdated}
        submitDecisionOptions={{ delayMs: 0 }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Approve and release' }))
    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByText(
        `Release revision ${runClean.revision} to ${runClean.target.environment}? You can undo this for 10 minutes.`,
      ),
    ).toBeVisible()

    await user.click(within(dialog).getByRole('button', { name: 'Approve and release' }))

    await waitFor(() => expect(onRunUpdated).toHaveBeenCalledTimes(1))
    const updated = onRunUpdated.mock.calls[0][0] as Run
    expect(updated.status).toBe('approved')
  })
})
