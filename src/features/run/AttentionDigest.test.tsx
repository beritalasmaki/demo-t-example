import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { AttentionItem } from '../../lib/attention'
import { AttentionDigest } from './AttentionDigest'

const items: AttentionItem[] = [
  {
    id: 'attention-gates-fail',
    lead: '1 check failed.',
    body: 'Data retention.',
    linkHref: '#policy-gates-heading',
    linkLabel: 'See policy gates',
  },
  {
    id: 'attention-confidence-side_effects',
    lead: 'Side effects confidence is 38%.',
    body: 'Whether concurrent requests can race under load.',
    linkHref: '#confidence-heading',
    linkLabel: 'See confidence',
  },
]

describe('AttentionDigest', () => {
  it('renders nothing when there is nothing to flag', () => {
    const { container } = render(<AttentionDigest items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders every item, each linking to the region it came from', () => {
    render(<AttentionDigest items={items} />)
    expect(screen.getByRole('heading', { name: 'Before you rely on this' })).toBeVisible()

    expect(screen.getByText(/1 check failed\./)).toBeVisible()
    const gateLink = screen.getByRole('link', { name: 'See policy gates' })
    expect(gateLink).toHaveAttribute('href', '#policy-gates-heading')

    expect(screen.getByText(/Side effects confidence is 38%\./)).toBeVisible()
    const confidenceLink = screen.getByRole('link', { name: 'See confidence' })
    expect(confidenceLink).toHaveAttribute('href', '#confidence-heading')
  })

  it('renders a lead with no body sentence', () => {
    render(
      <AttentionDigest
        items={[
          {
            id: 'attention-note-t1',
            lead: 'The nightly job did not run.',
            linkHref: '#timeline-event-t1',
            linkLabel: 'See audit log',
          },
        ]}
      />,
    )
    expect(screen.getByText('The nightly job did not run.')).toBeVisible()
  })
})
