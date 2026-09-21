import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EvidenceLink } from './EvidenceLink'

describe('EvidenceLink', () => {
  it('renders the label and count as visible text', () => {
    render(<EvidenceLink href="#timeline-event-a" label="Evidence" count={2} />)
    expect(screen.getByRole('link', { name: 'Evidence (2)' })).toBeVisible()
  })

  it('is a real link pointing at the given href', () => {
    render(<EvidenceLink href="#timeline-event-a" label="Evidence" count={1} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '#timeline-event-a')
  })
})
