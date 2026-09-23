import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { runClean, runMessy, runMessyPending } from '../../fixtures'
import { UnverifiedList } from './UnverifiedList'

describe('UnverifiedList', () => {
  it('before a decision: what approving would accept, open items marked', () => {
    render(<UnverifiedList run={runMessyPending} />)
    expect(screen.getByRole('heading', { name: 'What is not checked' })).toBeVisible()
    expect(screen.getAllByRole('listitem')).toHaveLength(6)
    expect(screen.getAllByText('Open:')).toHaveLength(4)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('after a decision: the list to explain later, which can be copied', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    render(<UnverifiedList run={runMessy} />)

    expect(screen.getByRole('heading', { name: 'What is still unverified' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Copy this list for the record' }))
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('- Open-source licensing — not run'),
    )
    expect(await screen.findByText('Copied.')).toBeVisible()
  })

  it('says "Nothing" when every check ran and nothing is unverified', () => {
    render(
      <UnverifiedList
        run={{ ...runClean, confidence: runClean.confidence.filter((a) => a.value >= 0.85) }}
      />,
    )
    expect(screen.getByText(/^Nothing\./)).toBeVisible()
  })
})
