import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { runMessy } from '../../fixtures'
import { UndoBox } from './UndoBox'

const decidedAt = new Date(runMessy.decision!.at).getTime()

describe('UndoBox', () => {
  it('counts down the undo window', () => {
    render(
      <UndoBox
        run={runMessy}
        onRunUpdated={vi.fn()}
        now={new Date(decidedAt + 3 * 60_000 + 6_000)}
      />,
    )
    expect(screen.getByRole('timer')).toHaveTextContent('6 min 54 s')
  })

  it('undo puts the run back to awaiting review', async () => {
    const user = userEvent.setup()
    const onRunUpdated = vi.fn()
    render(<UndoBox run={runMessy} onRunUpdated={onRunUpdated} now={new Date(decidedAt)} />)
    await user.click(screen.getByRole('button', { name: 'Undo this decision' }))
    expect(onRunUpdated).toHaveBeenCalledWith(
      expect.objectContaining({ decision: undefined, status: 'awaiting_review' }),
    )
  })

  it('says when the window has closed, with no button', () => {
    render(
      <UndoBox run={runMessy} onRunUpdated={vi.fn()} now={new Date(decidedAt + 11 * 60_000)} />,
    )
    expect(screen.getByText('Undo window closed')).toBeVisible()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('UndoBox success check', () => {
  it('shows the outcome beside a still check for a run that loaded already decided', () => {
    render(<UndoBox run={runMessy} onRunUpdated={vi.fn()} now={new Date(decidedAt)} />)
    const heading = screen.getByRole('heading', { name: 'Approved' })
    expect(heading.querySelector('.t-success-check')).toHaveAttribute('data-state', 'static')
    expect(heading).not.toHaveFocus()
  })

  it('plays the check and takes focus when the decision was just made here', () => {
    render(<UndoBox run={runMessy} onRunUpdated={vi.fn()} now={new Date(decidedAt)} celebrate />)
    const heading = screen.getByRole('heading', { name: 'Approved' })
    expect(heading.querySelector('.t-success-check')).toHaveAttribute('data-state', 'in')
    expect(heading).toHaveFocus()
  })

  it('shows no check for a decision that is not an approval', () => {
    const rejected = {
      ...runMessy,
      decision: { ...runMessy.decision!, outcome: 'rejected' as const },
    }
    render(<UndoBox run={rejected} onRunUpdated={vi.fn()} now={new Date(decidedAt)} />)
    expect(
      screen.getByRole('heading', { name: 'Rejected' }).querySelector('.t-success-check'),
    ).toBeNull()
  })
})
