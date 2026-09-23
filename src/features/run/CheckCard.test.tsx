import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { runBlocked, runMessy } from '../../fixtures'
import { CheckCard } from './CheckCard'

const gate = (run: typeof runMessy, id: string) => run.gates.find((g) => g.id === id)!

describe('CheckCard', () => {
  it('says why a check did not run, and the rule in plain words', () => {
    render(<CheckCard gate={gate(runMessy, 'licensing')} timeline={runMessy.timeline} actionable />)
    expect(screen.getByText('Open-source licensing — did not run.')).toBeVisible()
    expect(screen.getByText(/timed out after 10 minutes/)).toBeVisible()
    expect(screen.getByText(/The rule: New dependencies/)).toBeVisible()
    expect(screen.getByRole('button', { name: 'Run check again' })).toBeVisible()
  })

  it('shows a failed check, and an exception with who granted it and why', () => {
    const { unmount } = render(
      <CheckCard gate={gate(runBlocked, 'data-retention')} timeline={runBlocked.timeline} />,
    )
    expect(screen.getByText('Data retention — failed.')).toBeVisible()
    unmount()

    render(
      <CheckCard gate={gate(runBlocked, 'licensing')} timeline={runBlocked.timeline} actionable />,
    )
    expect(screen.getByText('Kaisa Heinämäki')).toBeVisible()
    expect(screen.getByText(/LGL-4471/)).toBeVisible()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders nothing for a passed check', () => {
    const { container } = render(
      <CheckCard gate={gate(runMessy, 'security')} timeline={runMessy.timeline} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
