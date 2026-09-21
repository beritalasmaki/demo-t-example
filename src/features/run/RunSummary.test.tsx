import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Run, TimelineEvent } from '../../lib/types'
import { RunSummary } from './RunSummary'

const timeline: TimelineEvent[] = [
  { id: 'a', at: '2026-01-01T00:00:00Z', type: 'file_change', title: 'Edited a file.' },
  { id: 'b', at: '2026-01-01T00:01:00Z', type: 'test_run', title: 'Ran the tests.' },
]

const summary: Run['summary'] = [
  { text: 'Added a feature.', evidenceIds: ['a'] },
  { text: 'Two tests passed.', evidenceIds: ['a', 'b'] },
]

describe('RunSummary', () => {
  it('renders every sentence backed by real evidence', () => {
    render(<RunSummary summary={summary} timeline={timeline} />)
    expect(screen.getByText('Added a feature.')).toBeVisible()
    expect(screen.getByText('Two tests passed.')).toBeVisible()
  })

  it('links each sentence to its evidence, with the count of events behind it', () => {
    render(<RunSummary summary={summary} timeline={timeline} />)
    expect(screen.getByRole('link', { name: 'Evidence (1)' })).toHaveAttribute(
      'href',
      '#timeline-event-a',
    )
    expect(screen.getByRole('link', { name: 'Evidence (2)' })).toHaveAttribute(
      'href',
      '#timeline-event-a',
    )
  })

  it('does not render a sentence whose evidence does not resolve to a real event', () => {
    render(
      <RunSummary
        summary={[{ text: 'Unsupported claim.', evidenceIds: ['does-not-exist'] }]}
        timeline={timeline}
      />,
    )
    expect(screen.queryByText('Unsupported claim.')).not.toBeInTheDocument()
  })

  it('shows a plain message when nothing survives evidence resolution', () => {
    render(
      <RunSummary
        summary={[{ text: 'Unsupported claim.', evidenceIds: ['does-not-exist'] }]}
        timeline={timeline}
      />,
    )
    expect(screen.getByText('No summary available.')).toBeVisible()
  })

  it('shows a loading state, announced to assistive tech', () => {
    render(<RunSummary summary={[]} timeline={[]} isLoading />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading the summary')
  })

  it('never renders more than five sentences', () => {
    const many: Run['summary'] = Array.from({ length: 8 }, (_, i) => ({
      text: `Sentence ${i}.`,
      evidenceIds: ['a'],
    }))
    render(<RunSummary summary={many} timeline={timeline} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
  })
})
