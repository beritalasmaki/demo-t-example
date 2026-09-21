import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Rocket } from 'lucide-react'
import { Tag } from './Tag'

describe('Tag', () => {
  it('renders the label as visible text', () => {
    render(<Tag icon={Rocket}>Production</Tag>)
    expect(screen.getByText('Production')).toBeVisible()
  })

  it('hides the icon from assistive tech, carrying no colour of its own', () => {
    const { container } = render(<Tag icon={Rocket}>Production</Tag>)
    const icon = container.querySelector('svg')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })
})
