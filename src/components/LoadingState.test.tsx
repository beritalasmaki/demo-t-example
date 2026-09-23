import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingState } from './LoadingState'

describe('LoadingState', () => {
  it('is one status, announced by its label, with the orb hidden from assistive tech', () => {
    const { container } = render(<LoadingState label="Loading run…" />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading run…')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })

  it('centres its content', () => {
    render(<LoadingState label="Loading run…" />)
    expect(screen.getByRole('status')).toHaveClass('items-center', 'justify-center')
  })
})
