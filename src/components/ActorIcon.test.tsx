import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { User } from 'lucide-react'
import { ActorIcon } from './ActorIcon'

describe('ActorIcon', () => {
  it('renders the given icon inside a circular badge', () => {
    const { container } = render(<ActorIcon icon={User} />)
    const badge = container.firstElementChild!
    expect(badge).toHaveClass('rounded-full')
    expect(badge.querySelector('svg')).not.toBeNull()
  })

  it('hides the icon from assistive tech', () => {
    const { container } = render(<ActorIcon icon={User} />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
