import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders the label as visible text, not only as an icon', () => {
    render(<StatusBadge tone="danger" label="Failed" />)
    expect(screen.getByText('Failed')).toBeVisible()
  })

  it('hides its icon from assistive tech, since the text already carries the meaning', () => {
    const { container } = render(<StatusBadge tone="success" label="Passed" />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it.each([
    ['success', 'text-status-pass'],
    ['danger', 'text-status-fail'],
    ['warning', 'text-status-waived'],
    ['neutral', 'text-status-not-applicable'],
    ['info', 'text-status-unknown'],
  ] as const)('renders %s with the %s token', (tone, expectedClass) => {
    render(<StatusBadge tone={tone} label="Label" />)
    expect(screen.getByText('Label').closest('span')).toHaveClass(expectedClass)
  })
})
