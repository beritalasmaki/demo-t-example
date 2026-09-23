import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { runBlocked, runMessy } from '../../fixtures'
import { StepsTab } from './StepsTab'

describe('StepsTab', () => {
  it('shows the run’s shape and one row per step, with the repeated steps folded', () => {
    render(<StepsTab run={runMessy} />)
    expect(screen.getByText(/0 errors, 0 retries/)).toBeVisible()
    // 20 single steps + 1 folded group + the header row.
    expect(screen.getAllByRole('row')).toHaveLength(22)
    expect(screen.getByRole('button', { name: /180 similar steps/, expanded: false })).toBeVisible()
  })

  it('opens a group to a preview, then to every step', async () => {
    const user = userEvent.setup()
    render(<StepsTab run={runMessy} />)

    await user.click(screen.getByRole('button', { name: /180 similar steps/ }))
    expect(screen.getByText('Checked the gateway config for shard-006.')).toBeVisible()
    expect(screen.queryByText('Checked the gateway config for shard-007.')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Show 174 more' }))
    expect(screen.getByText('Checked the gateway config for shard-180.')).toBeVisible()
  })

  it('names who did each step, with the gate’s own result', () => {
    render(<StepsTab run={runMessy} />)
    expect(screen.getByText('Aino Lehtomäki')).toBeVisible()
    expect(screen.getAllByText('Not run')).toHaveLength(2)
    expect(screen.getByText('Open')).toBeVisible()
  })

  it('never folds an error, and counts errors and retries', () => {
    render(<StepsTab run={runBlocked} />)
    expect(screen.getByText(/2 errors, 1 retry/)).toBeVisible()
    expect(screen.getByText('Error')).toBeVisible()
  })

  it('brings a linked step into view, opening its group', () => {
    render(<StepsTab run={runMessy} focusEventId="ms150" />)
    const row = document.getElementById('step-ms150')!
    expect(row).toBeInTheDocument()
    expect(row).toHaveFocus()
  })
})
