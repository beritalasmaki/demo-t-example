import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RegionCard } from './RegionCard'

describe('RegionCard', () => {
  it('renders children', () => {
    render(<RegionCard>Region content</RegionCard>)
    expect(screen.getByText('Region content')).toBeVisible()
  })

  it('renders a div by default', () => {
    const { container } = render(<RegionCard>Content</RegionCard>)
    expect(container.querySelector('div')).not.toBeNull()
  })

  it('renders the element passed via `as`', () => {
    render(<RegionCard as="header">Content</RegionCard>)
    expect(screen.getByText('Content').closest('header')).not.toBeNull()
  })

  it('merges an extra className with its own card styling', () => {
    render(<RegionCard className="extra-class">Content</RegionCard>)
    const el = screen.getByText('Content')
    expect(el).toHaveClass('extra-class')
    expect(el).toHaveClass('border-border-subtle')
  })
})
