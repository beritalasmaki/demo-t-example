import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { runBlocked, runMessy, runMessyPending } from '../../fixtures'
import { StoryTimeline } from './StoryTimeline'

describe('StoryTimeline', () => {
  it('tells each step with its time span and label', () => {
    render(<StoryTimeline run={runMessyPending} onShowSteps={vi.fn()} />)
    const region = screen.getByRole('region', { name: 'What happened, in order' })
    // Every story step, plus the closing "Waiting for a decision" step.
    expect(region.querySelectorAll(':scope > ol > li')).toHaveLength(
      runMessyPending.story.length + 1,
    )
    expect(screen.getByText(/· Plan$/)).toBeVisible()
    expect(screen.getByText(/· 6 files changed$/)).toBeVisible()
  })

  it('shows changed files as chips, marked added or edited', () => {
    render(<StoryTimeline run={runMessyPending} onShowSteps={vi.fn()} />)
    const files = screen.getByRole('list', { name: 'Changed files' })
    expect(within(files).getAllByRole('listitem')).toHaveLength(6)
    expect(within(files).getAllByText('Added', { exact: false })).toHaveLength(2)
    expect(within(files).getAllByText('Edited', { exact: false })).toHaveLength(4)
  })

  it('puts each score where it was made, with its level and action, and a missing score as Not checked', () => {
    render(<StoryTimeline run={runMessyPending} onShowSteps={vi.fn()} />)
    expect(screen.getByText('Low')).toBeVisible()
    expect(screen.getByText('Check this yourself before approving')).toBeVisible()
    expect(screen.getByText('Not checked')).toBeVisible()
  })

  it('shows checks that did not run with a way forward, only before a decision', () => {
    const { unmount } = render(<StoryTimeline run={runMessyPending} onShowSteps={vi.fn()} />)
    expect(screen.getAllByRole('button', { name: 'Run check again' })).toHaveLength(2)
    unmount()

    render(<StoryTimeline run={runMessy} onShowSteps={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Run check again' })).not.toBeInTheDocument()
    expect(screen.getByText(/Open-source licensing — did not run\./)).toBeVisible()
  })

  it('"Run check again" records the request without changing the result', async () => {
    const user = userEvent.setup()
    render(<StoryTimeline run={runMessyPending} onShowSteps={vi.fn()} />)
    await user.click(screen.getAllByRole('button', { name: 'Run check again' })[0])
    expect(screen.getByRole('button', { name: 'Check asked for' })).toBeDisabled()
    expect(screen.getByText(/Until then it stays “Not run”/)).toBeVisible()
  })

  it('names the person who reviewed a check, and an exception with its reason', () => {
    render(<StoryTimeline run={runBlocked} onShowSteps={vi.fn()} />)
    expect(screen.getByText('Aino Lehtomäki')).toBeVisible()
    expect(screen.getByText(/Open-source licensing — has an exception\./)).toBeVisible()
    expect(screen.getByText(/Already reviewed and cleared/)).toBeVisible()
  })

  it('ends on "Waiting for a decision", or on the decision and its reason', () => {
    const { unmount } = render(<StoryTimeline run={runMessyPending} onShowSteps={vi.fn()} />)
    expect(screen.getByText(/· Waiting for a decision$/)).toBeVisible()
    unmount()

    render(<StoryTimeline run={runMessy} onShowSteps={vi.fn()} />)
    expect(screen.getByText(/· Decision$/)).toBeVisible()
    expect(screen.getByText(/approved the run and released revision/)).toBeVisible()
    expect(screen.getByText(/after ticking 3 open items/)).toBeVisible()
  })

  it('links a phase to its steps', async () => {
    const user = userEvent.setup()
    const onShowSteps = vi.fn()
    render(<StoryTimeline run={runMessyPending} onShowSteps={onShowSteps} />)
    await user.click(screen.getByRole('button', { name: '3 steps' }))
    expect(onShowSteps).toHaveBeenCalledWith('m2')
  })
})
