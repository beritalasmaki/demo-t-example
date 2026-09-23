import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScoreCard } from './ScoreCard'

const area = {
  area: 'side_effects' as const,
  value: 0.52,
  basis: 'Based only on two days of test-system logs.',
  rationale: 'The gateway answers in a different order.',
  unverified: ['Whether two refunds might clash under load.'],
  missing: false as const,
}

describe('ScoreCard', () => {
  it('never shows a bare number: level, action, basis and what could not be checked', () => {
    render(<ScoreCard area={area} />)
    expect(screen.getByText('Side effects confidence', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('52%', { exact: false })).toBeVisible()
    expect(screen.getByText('Low')).toBeVisible()
    expect(screen.getByText('Check this yourself before approving')).toBeVisible()
    expect(screen.getByText(/Based only on two days/)).toBeVisible()
    expect(screen.getByText(/Whether two refunds might clash/)).toBeVisible()
  })

  it('drops the action after a decision', () => {
    render(<ScoreCard area={area} decided />)
    expect(screen.queryByText('Check this yourself before approving')).not.toBeInTheDocument()
    expect(screen.getByText('Low')).toBeVisible()
  })

  it('shows a missing area as Not checked', () => {
    render(<ScoreCard area={{ area: 'security', missing: true }} />)
    expect(screen.getByText('Not checked')).toBeVisible()
    expect(screen.getByText(/the agent gave no score/)).toBeVisible()
  })
})
