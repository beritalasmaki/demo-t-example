import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Decision } from '../../lib/types'
import { DecisionStatusBanner } from './DecisionStatusBanner'

function decision(overrides: Partial<Decision> & Pick<Decision, 'outcome'>): Decision {
  return {
    by: 'Marcus Webb',
    at: '2026-01-01T00:00:00Z',
    acknowledgedGateIds: [],
    revision: 'abc123',
    ...overrides,
  }
}

describe('DecisionStatusBanner', () => {
  it('names who decided and the outcome, for approved', () => {
    render(<DecisionStatusBanner decision={decision({ outcome: 'approved' })} />)
    expect(screen.getByText(/Approved by Marcus Webb/)).toBeVisible()
  })

  it('names who decided and the outcome, for changes requested', () => {
    render(<DecisionStatusBanner decision={decision({ outcome: 'changes_requested' })} />)
    expect(screen.getByText(/Changes requested by Marcus Webb/)).toBeVisible()
  })

  it('names who decided and the outcome, for rejected', () => {
    render(<DecisionStatusBanner decision={decision({ outcome: 'rejected' })} />)
    expect(screen.getByText(/Rejected by Marcus Webb/)).toBeVisible()
  })

  it('links to the Decision region', () => {
    render(<DecisionStatusBanner decision={decision({ outcome: 'approved' })} />)
    const link = screen.getByRole('link', { name: 'See the decision, and undo it if needed' })
    expect(link).toHaveAttribute('href', '#decision-heading')
  })
})
