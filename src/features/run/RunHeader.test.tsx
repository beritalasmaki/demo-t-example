import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { runClean } from '../../fixtures'
import type { Run } from '../../lib/types'
import { RunHeader } from './RunHeader'

function withRun(overrides: Partial<Run>): Run {
  return { ...runClean, ...overrides }
}

describe('RunHeader', () => {
  it('shows the system, environment and status without opening anything', () => {
    render(<RunHeader run={runClean} />)
    expect(screen.getByText(runClean.target.system)).toBeVisible()
    expect(screen.getByText('Staging')).toBeVisible()
    expect(screen.getByText('Awaiting review')).toBeVisible()
  })

  it('uses the exact status labels from Content rules for every RunStatus value', () => {
    const labels: Record<Run['status'], string> = {
      running: 'Running',
      blocked: 'Blocked',
      awaiting_review: 'Awaiting review',
      approved: 'Approved',
      changes_requested: 'Changes requested',
      rejected: 'Rejected',
    }
    for (const [status, label] of Object.entries(labels) as [Run['status'], string][]) {
      const { unmount } = render(<RunHeader run={withRun({ status })} />)
      expect(screen.getByText(label)).toBeVisible()
      unmount()
    }
  })

  it('distinguishes production from staging by visible text, not colour alone', () => {
    render(
      <RunHeader run={withRun({ target: { ...runClean.target, environment: 'production' } })} />,
    )
    expect(screen.getByText('Production')).toBeVisible()
  })

  it('never hides the environment or status behind a long initiative name', () => {
    const longInitiative =
      'A very long initiative name that should truncate visually but must never push the ' +
      'environment or status tag out of the header or out of the document'
    render(<RunHeader run={withRun({ initiative: longInitiative })} />)

    expect(screen.getByText('Staging')).toBeVisible()
    expect(screen.getByText('Awaiting review')).toBeVisible()
    // Truncated only at md and up — see RunHeader.tsx's own comment: below md, the `title`
    // tooltip this relies on to reveal the rest never fires on a touchscreen.
    expect(screen.getByText(longInitiative).closest('h2')).toHaveClass('md:truncate')
  })

  it('keeps agent, model, run id and the full time zone name closed by default', () => {
    render(<RunHeader run={runClean} />)

    // jsdom does not hide closed <details> content the way a real browser does (see
    // src/components/Disclosure.test.tsx), so "hidden until opened" is verified the same way
    // that file does: the <details> has no `open` attribute — never by asserting the content
    // is absent from the DOM.
    const details = screen.getByText('Show details').closest('details')
    expect(details).not.toHaveAttribute('open')
    expect(details).toHaveTextContent(runClean.id)
    expect(details).toHaveTextContent(runClean.agent.model)
    expect(details).toHaveTextContent(`${runClean.agent.name} ${runClean.agent.version}`)
  })

  it('shows the started and finished time, with the time zone stated once', () => {
    render(<RunHeader run={runClean} />)
    expect(screen.getByText('Started').closest('p')).toHaveTextContent(/^Started /)
    expect(screen.getByText('Finished').closest('p')).toHaveTextContent(/Finished/)
  })

  it('renders approved and changes_requested status as a filled StatusBadge', () => {
    render(<RunHeader run={withRun({ status: 'approved' })} />)
    expect(screen.getByText('Approved').closest('span')).toHaveClass('bg-status-pass-tint-bg')
  })

  it('renders every other status as the plain neutral Tag, not a StatusBadge', () => {
    for (const status of ['running', 'blocked', 'awaiting_review', 'rejected'] as const) {
      const { unmount } = render(<RunHeader run={withRun({ status })} />)
      const label = screen.getByText(
        {
          running: 'Running',
          blocked: 'Blocked',
          awaiting_review: 'Awaiting review',
          rejected: 'Rejected',
        }[status],
      )
      expect(label.closest('span')).not.toHaveClass('bg-status-pass-tint-bg')
      expect(label.closest('span')).not.toHaveClass('bg-status-waived-tint-bg')
      unmount()
    }
  })
})
