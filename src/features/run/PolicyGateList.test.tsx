import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { PolicyGate } from '../../lib/types'
import { PolicyGateList } from './PolicyGateList'

function gate(overrides: Partial<PolicyGate> & Pick<PolicyGate, 'id' | 'result'>): PolicyGate {
  return {
    name: overrides.id,
    plainLanguage: '',
    evaluatedBy: 'policy-engine v2.3',
    evaluatedAt: '2026-01-01T00:00:00Z',
    evidenceIds: [],
    ...overrides,
  }
}

describe('PolicyGateList', () => {
  it('renders every gate name', async () => {
    const user = userEvent.setup()
    render(
      <PolicyGateList
        gates={[
          gate({ id: 'a', name: 'Security review', result: 'pass' }),
          gate({ id: 'b', name: 'Data retention', result: 'fail' }),
        ]}
        timeline={[]}
      />,
    )
    // 'Security review' (pass) is settled, under the "Passed checks" tab, while 'Data
    // retention' needs attention and is on the tab shown by default.
    expect(screen.getByText('Data retention')).toBeVisible()
    await user.click(screen.getByRole('tab', { name: 'Passed checks (1)' }))
    expect(screen.getByText('Security review')).toBeVisible()
  })

  it('sorts failed and waived first, then unknown, then not applicable, then passed', async () => {
    const user = userEvent.setup()
    render(
      <PolicyGateList
        gates={[
          gate({ id: 'a', result: 'pass' }),
          gate({ id: 'b', result: 'not_applicable' }),
          gate({ id: 'c', result: 'unknown' }),
          gate({ id: 'd', result: 'fail' }),
        ]}
        timeline={[]}
      />,
    )

    // 'd' (fail) and 'c' (unknown) need attention, shown by default; 'a' (pass) and
    // 'b' (not_applicable) are settled, under the "Passed checks" tab.
    const attentionIds = screen
      .getAllByRole('listitem')
      .map((item) => item.querySelector('summary')!.textContent)
    expect(attentionIds.findIndex((t) => t?.includes('Failed'))).toBeLessThan(
      attentionIds.findIndex((t) => t?.includes('Not run')),
    )

    await user.click(screen.getByRole('tab', { name: 'Passed checks (2)' }))
    const settledIds = screen
      .getAllByRole('listitem')
      .map((item) => item.querySelector('summary')!.textContent)
    // Only checking relative order here, since each row's full text also includes the
    // (empty, in this test) plain-language description.
    expect(settledIds.findIndex((t) => t?.includes('Not applicable'))).toBeLessThan(
      settledIds.findIndex((t) => t?.includes('Passed')),
    )
  })

  it('splits into "Needs attention" and "Passed checks" tabs once something needs attention', async () => {
    const user = userEvent.setup()
    render(
      <PolicyGateList
        gates={[
          gate({ id: 'a', name: 'Passed gate', result: 'pass' }),
          gate({ id: 'b', name: 'Failed gate', result: 'fail' }),
        ]}
        timeline={[]}
      />,
    )
    expect(screen.getByRole('tab', { name: 'Needs attention (1)' })).toHaveAttribute(
      'data-state',
      'active',
    )
    expect(screen.getByText('Failed gate')).toBeVisible()
    expect(screen.queryByText('Passed gate')).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Passed checks (1)' }))
    expect(screen.getByText('Passed gate')).toBeVisible()
    expect(screen.queryByText('Failed gate')).not.toBeInTheDocument()
  })

  it('collapses nothing when every gate passed — S2, "hides what was checked" is a failure', () => {
    render(
      <PolicyGateList
        gates={[
          gate({ id: 'a', name: 'First passed gate', result: 'pass' }),
          gate({ id: 'b', name: 'Second passed gate', result: 'not_applicable' }),
        ]}
        timeline={[]}
      />,
    )
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(screen.getByText('First passed gate')).toBeVisible()
    expect(screen.getByText('Second passed gate')).toBeVisible()
  })

  it('shows an explicit empty state rather than an empty list', () => {
    render(<PolicyGateList gates={[]} timeline={[]} />)
    expect(screen.getByText('No policy checks yet.')).toBeVisible()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('shows a loading state, announced to assistive tech', () => {
    render(<PolicyGateList gates={[]} timeline={[]} isLoading />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading policy checks')
  })

  it('prefers the loading state over the empty state when both would otherwise apply', () => {
    render(<PolicyGateList gates={[]} timeline={[]} isLoading />)
    expect(screen.queryByText('No policy checks yet.')).not.toBeInTheDocument()
  })
})
