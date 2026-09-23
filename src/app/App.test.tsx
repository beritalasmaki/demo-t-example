import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INTRO_SEEN_KEY } from './intro'
import { runClean, runMessyPending } from '../fixtures'
import App from './App'

// These tests are about the page; the intro is covered on its own (WelcomeIntro.test.tsx).
beforeEach(() => {
  window.sessionStorage.setItem(INTRO_SEEN_KEY, 'seen')
})

afterEach(() => {
  window.history.pushState({}, '', '/')
  window.sessionStorage.clear()
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

  it('on a new visit, lays the intro over the page, which is already loading underneath', async () => {
    window.sessionStorage.clear()
    window.history.pushState({}, '', '/?delay=50')
    render(<App />)
    expect(screen.getByTestId('welcome-intro')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Loading run')
    expect(await screen.findByText(runMessyPending.id)).toBeVisible()
  })

  it("hands off to the page's own loading state when a skip beats a slow load", async () => {
    window.sessionStorage.clear()
    window.history.pushState({}, '', '/?delay=100')
    render(<App />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByTestId('welcome-intro')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Loading run')
    expect(await screen.findByText(runMessyPending.id)).toBeVisible()
  })

  it('does not show the intro once it has been seen', () => {
    render(<App />)
    expect(screen.queryByTestId('welcome-intro')).not.toBeInTheDocument()
  })
})
