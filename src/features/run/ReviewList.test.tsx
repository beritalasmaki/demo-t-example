import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ReviewList } from './ReviewList'

describe('ReviewList', () => {
  it('lists every run, each linking to its review page', async () => {
    render(<ReviewList runHref={(id) => `?run=${id}`} options={{ delayMs: 0 }} />)
    const link = await screen.findByRole('link', { name: /Add a CSV export/ })
    expect(link).toHaveAttribute('href', '?run=run-clean')
    expect(screen.getAllByRole('link')).toHaveLength(4)
  })

  it('shows a loading state, and a failed load with Retry', async () => {
    const { unmount } = render(<ReviewList runHref={(id) => id} options={{ delayMs: 50 }} />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading reviews')
    unmount()

    render(<ReviewList runHref={(id) => id} options={{ delayMs: 0, simulateNetworkError: true }} />)
    expect(await screen.findByText(/Could not load your reviews/)).toBeVisible()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible()
  })
})
