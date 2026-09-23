import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { runClean, runMessyPending } from '../fixtures'
import App from './App'

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('App', () => {
  it('shows a loading state before any run arrives', () => {
    render(<App />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading run')
  })

  it('defaults to run-messy-pending, with no ?run= query given', async () => {
    render(<App />)
    expect(await screen.findByText(runMessyPending.id)).toBeVisible()
  })

  it('has no logo or main menu of its own: it opens on the page’s own breadcrumb', async () => {
    render(<App />)
    expect(await screen.findByRole('navigation', { name: 'Breadcrumb' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'My reviews' })).toHaveAttribute(
      'href',
      '?view=reviews',
    )
  })

  it('shows the "My reviews" list for ?view=reviews', async () => {
    window.history.pushState({}, '', '/?view=reviews')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'My reviews' })).toBeVisible()
  })

  it('loads the run named by ?run=', async () => {
    window.history.pushState({}, '', `/?run=${runClean.id}`)
    render(<App />)
    expect(await screen.findByText(runClean.target.system)).toBeVisible()
  })

  it('shows a plain not-found message for an unknown ?run= id', async () => {
    window.history.pushState({}, '', '/?run=run-does-not-exist')
    render(<App />)
    expect(await screen.findByText(/Could not find a run with id/)).toBeVisible()
  })
})
