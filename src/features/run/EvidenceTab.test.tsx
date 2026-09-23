import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { runMessyPending } from '../../fixtures'
import { EvidenceTab } from './EvidenceTab'

describe('EvidenceTab', () => {
  it('groups evidence by what it supports', () => {
    render(<EvidenceTab run={runMessyPending} onOpenStep={vi.fn()} />)
    for (const name of ['The code change', 'Tests', 'Policy checks', 'Findings and side effects']) {
      expect(screen.getByRole('region', { name })).toBeVisible()
    }
    expect(screen.getByText('Supports: 4 passed · 2 not run · no security score')).toBeVisible()
  })

  it('labels checks that did not run and a person’s review', () => {
    render(<EvidenceTab run={runMessyPending} onOpenStep={vi.fn()} />)
    const checks = screen.getByRole('region', { name: 'Policy checks' })
    expect(within(checks).getAllByText('Not run')).toHaveLength(2)
    expect(within(checks).getByText('Human review')).toBeVisible()
    expect(within(checks).getByText('Aino Lehtomäki')).toBeVisible()
  })

  it('"Open" goes to the step in the full record', async () => {
    const user = userEvent.setup()
    const onOpenStep = vi.fn()
    render(<EvidenceTab run={runMessyPending} onOpenStep={onOpenStep} />)
    await user.click(
      screen.getByRole('button', { name: 'Open step: Licensing scan did not complete.' }),
    )
    expect(onOpenStep).toHaveBeenCalledWith('m16')
  })
})
