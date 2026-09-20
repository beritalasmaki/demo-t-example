import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { TimelineEvent } from '../../lib/types'
import { Timeline } from './Timeline'

const events: TimelineEvent[] = [
  { id: 't1', at: '2026-03-04T14:02:00Z', type: 'plan', title: 'Planned the change.' },
  { id: 't2', at: '2026-03-04T14:03:00Z', type: 'tool_call', title: 'Read the config file.' },
  {
    id: 't3',
    at: '2026-03-04T14:05:00Z',
    type: 'error',
    title: 'Test run failed to start.',
    severity: 'error',
  },
  { id: 't4', at: '2026-03-04T14:06:00Z', type: 'test_run', title: 'Retried the test suite.' },
  { id: 't5', at: '2026-03-04T14:07:00Z', type: 'test_run', title: 'Ran the full suite.' },
]

describe('Timeline', () => {
  it('shows the shape of the run first: step, error and retry counts', () => {
    render(<Timeline events={events} startedAt="2026-03-04T14:02:00Z" />)
    expect(screen.getByText(/5 steps/)).toBeVisible()
    expect(screen.getByText(/1 error/)).toBeVisible()
    expect(screen.getByText(/1 retry/)).toBeVisible()
  })

  it('shows the empty state with the exact Content rules wording, using the run start time', () => {
    render(<Timeline events={[]} startedAt="2026-03-04T13:59:40Z" />)
    expect(screen.getByText(/^No events yet\. This run started .+ ago\.$/)).toBeVisible()
  })

  it('shows a loading state, announced to assistive tech', () => {
    render(<Timeline events={[]} startedAt="2026-03-04T14:02:00Z" isLoading />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading the audit log')
  })

  it('reports zero hidden events when every type is active', () => {
    render(<Timeline events={events} startedAt="2026-03-04T14:02:00Z" />)
    expect(screen.getByText('0 events hidden by the active filters.')).toBeVisible()
  })

  it('never hides an error or a retry, even filtered down to a single unrelated type', () => {
    render(
      <Timeline
        events={events}
        startedAt="2026-03-04T14:02:00Z"
        defaultActiveTypes={new Set<TimelineEvent['type']>(['plan'])}
      />,
    )

    // 5 total, 1 active ("plan") + 2 forced (error, retry) visible = 2 genuinely hidden.
    expect(screen.getByText('2 events hidden by the active filters.')).toBeVisible()
    expect(screen.getByText('Test run failed to start.')).toBeVisible()
    expect(screen.getByText('Retried the test suite.')).toBeVisible()
    expect(screen.queryByText('Ran the full suite.')).not.toBeInTheDocument()
  })

  it('updates the visible list and the hidden count when a filter is toggled, keeping focus on the chip', async () => {
    const user = userEvent.setup()
    render(<Timeline events={events} startedAt="2026-03-04T14:02:00Z" />)

    expect(screen.getByText('Read the config file.')).toBeInTheDocument()

    const toolCallsChip = screen.getByRole('button', { name: 'Tool calls' })
    await user.click(toolCallsChip)

    expect(screen.queryByText('Read the config file.')).not.toBeInTheDocument()
    expect(screen.getByText('1 event hidden by the active filters.')).toBeVisible()
    expect(toolCallsChip).toHaveFocus()
  })
})
