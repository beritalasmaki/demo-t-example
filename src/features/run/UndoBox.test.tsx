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
