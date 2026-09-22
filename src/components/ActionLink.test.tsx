import { Eye } from 'lucide-react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ActionLink } from './ActionLink'

describe('ActionLink', () => {
  it('links to the given href, with the label as visible text', () => {
    render(<ActionLink href="#policy-gates-heading">See policy gates</ActionLink>)
    const link = screen.getByRole('link', { name: 'See policy gates' })
    expect(link).toHaveAttribute('href', '#policy-gates-heading')
  })

  it('defaults to a trailing arrow icon', () => {
    render(<ActionLink href="#x">See x</ActionLink>)
    const link = screen.getByRole('link', { name: 'See x' })
    expect(link.lastElementChild?.tagName).toBe('svg')
  })

  it('renders a custom leading icon when asked', () => {
    render(
      <ActionLink href="#decision-heading" icon={Eye} iconPosition="start">
        View the decision details
      </ActionLink>,
    )
    const link = screen.getByRole('link', { name: 'View the decision details' })
    expect(link.firstElementChild?.tagName).toBe('svg')
  })
})
