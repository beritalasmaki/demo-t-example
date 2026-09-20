import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { TimelineEvent } from '../../lib/types'
import { TimelineEventRow } from './TimelineEventRow'

function renderRow(event: TimelineEvent) {
  return render(
    <ul>
      <TimelineEventRow event={event} defaultOpen />
    </ul>,
  )
}

describe('TimelineEventRow', () => {
  it('always shows the title and a formatted absolute + relative time', () => {
    renderRow({ id: 'a', at: '2026-01-01T00:00:00Z', type: 'plan', title: 'Planned the change.' })
    expect(screen.getByText('Planned the change.')).toBeVisible()
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeVisible()
  })

  it('renders every event type without throwing', () => {
    const types: TimelineEvent['type'][] = [
      'plan',
      'tool_call',
      'file_change',
      'test_run',
      'gate_eval',
      'error',
      'note',
    ]
    for (const type of types) {
      const { unmount } = renderRow({
        id: type,
        at: '2026-01-01T00:00:00Z',
        type,
        title: `A ${type} event`,
      })
      expect(screen.getByText(`A ${type} event`)).toBeVisible()
      unmount()
    }
  })

  it('hides detail and artefacts until opened, but keeps them on the screen (collapsed, not deleted)', () => {
    render(
      <ul>
        <TimelineEventRow
          event={{
            id: 'a',
            at: '2026-01-01T00:00:00Z',
            type: 'file_change',
            title: 'Edited a file',
            detail: 'The detail text.',
            artefactIds: ['src/some-file.ts'],
          }}
        />
      </ul>,
    )

    const details = screen.getByText('Edited a file').closest('details')!
    expect(details).not.toHaveAttribute('open')
    // Present in the DOM (collapsed), not deleted — see AGENTS.md non-negotiable 3 and
    // docs/spec-review-screen.md's "collapsed, never deleted from the screen".
    expect(screen.getByText('The detail text.')).toBeInTheDocument()
    expect(screen.getByText('src/some-file.ts')).toBeInTheDocument()
  })

  it('renders a plain, non-expandable row when there is nothing to expand', () => {
    render(
      <ul>
        <TimelineEventRow
          event={{ id: 'a', at: '2026-01-01T00:00:00Z', type: 'tool_call', title: 'Read a file.' }}
        />
      </ul>,
    )
    expect(screen.getByText('Read a file.').closest('details')).not.toBeInTheDocument()
  })

  it('colours an error event distinctly from an ordinary one', () => {
    const { container: errorContainer } = renderRow({
      id: 'a',
      at: '2026-01-01T00:00:00Z',
      type: 'error',
      title: 'It broke.',
      severity: 'error',
    })
    expect(errorContainer.querySelector('svg')).toHaveClass('text-status-fail')
  })

  it('says when a row is only shown because it is an error or a retry', () => {
    render(
      <ul>
        <TimelineEventRow
          event={{ id: 'a', at: '2026-01-01T00:00:00Z', type: 'error', title: 'It broke.' }}
          forcedVisible
        />
      </ul>,
    )
    expect(screen.getByText('Shown despite the active filters')).toBeVisible()
  })
})
