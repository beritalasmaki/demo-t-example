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
    // 'Security review' (pass) is settled, collapsed behind "Show N passed checks" since
    // 'Data retention' needs attention — open it so both names are in the accessibility tree.
    await user.click(screen.getByText('Show 1 passed check'))
    expect(screen.getByText('Security review')).toBeVisible()
    expect(screen.getByText('Data retention')).toBeVisible()
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

    // 'a' (pass) and 'b' (not_applicable) are settled — collapsed behind "Show N passed
    // checks" since 'd' needs attention. Open it so every gate is in the accessibility tree.
    await user.click(screen.getByText('Show 2 passed checks'))

    const ids = screen
      .getAllByRole('listitem')
      .map((item) => item.querySelector('summary')!.textContent)
    // Only checking relative order here, since each row's full text also includes the
    // (empty, in this test) plain-language description.
    expect(ids.findIndex((t) => t?.includes('Failed'))).toBeLessThan(
      ids.findIndex((t) => t?.includes('Not run')),
    )
    expect(ids.findIndex((t) => t?.includes('Not run'))).toBeLessThan(
      ids.findIndex((t) => t?.includes('Not applicable')),
    )
    expect(ids.findIndex((t) => t?.includes('Not applicable'))).toBeLessThan(
      ids.findIndex((t) => t?.includes('Passed')),
    )
  })

  it('collapses passed and not-applicable gates behind "Show N passed checks" once something needs attention', () => {
    render(
      <PolicyGateList
        gates={[
          gate({ id: 'a', name: 'Passed gate', result: 'pass' }),
          gate({ id: 'b', name: 'Failed gate', result: 'fail' }),
        ]}
        timeline={[]}
      />,
    )
    expect(screen.getByText('Needs attention · 1')).toBeVisible()
    expect(screen.getByText('Failed gate')).toBeVisible()
    expect(screen.getByText('Passed gate')).not.toBeVisible()
    expect(screen.getByText('Show 1 passed check')).toBeVisible()
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
    expect(screen.queryByText(/Needs attention/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Show \d+ passed/)).not.toBeInTheDocument()
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
