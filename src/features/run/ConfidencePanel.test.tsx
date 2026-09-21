import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { ConfidenceArea } from '../../lib/types'
import { ConfidencePanel } from './ConfidencePanel'

const confidence: ConfidenceArea[] = [
  {
    area: 'implementation',
    value: 0.72,
    basis: '14 passing tests covering 3 of 5 changed files.',
    rationale: 'The change mirrors an existing pattern in the same file.',
    unverified: ['Behaviour under concurrent writes.'],
  },
  {
    area: 'tests',
    value: 0.9,
    basis: '20 tests, all passing.',
    rationale: 'Covers the new and existing paths.',
    unverified: [],
  },
]

describe('ConfidencePanel', () => {
  it('always shows all four areas, even when only two are reported', () => {
    render(<ConfidencePanel confidence={confidence} />)
    expect(screen.getByText('Implementation')).toBeVisible()
    expect(screen.getByText('Tests')).toBeVisible()
    expect(screen.getByText('Security')).toBeVisible()
    expect(screen.getByText('Side effects')).toBeVisible()
  })

  it('shows "Not checked" for an area the model did not report', () => {
    render(<ConfidencePanel confidence={confidence} />)
    const security = screen.getByText('Security').closest('li')!
    expect(security).toHaveTextContent('Not checked')
  })

  it('shows what could not be verified before the confidence value, never a bare number', () => {
    render(<ConfidencePanel confidence={confidence} />)
    const row = screen.getByText('Implementation').closest('li')!
    expect(row).toHaveTextContent('Could not verify')
    expect(row).toHaveTextContent('Confidence 72% — 14 passing tests')
  })

  it('hides the rationale until the row is opened, by keyboard', async () => {
    const user = userEvent.setup()
    render(<ConfidencePanel confidence={confidence} />)

    expect(
      screen.getByText('The change mirrors an existing pattern in the same file.'),
    ).not.toBeVisible()

    const toggle = screen.getByText('Implementation').closest('summary')!
    await user.click(toggle)
    expect(
      screen.getByText('The change mirrors an existing pattern in the same file.'),
    ).toBeVisible()
    expect(toggle).toHaveFocus()
  })

  it('shows a loading state', () => {
    render(<ConfidencePanel confidence={[]} isLoading />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading confidence')
  })
})
