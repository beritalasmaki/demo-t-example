import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { runClean, runMessy } from '../fixtures'
import App from './App'

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('App', () => {
  it('shows a loading state before any run arrives', () => {
    render(<App />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading run')
  })

  it('defaults to run-messy, with no ?run= query given', async () => {
    render(<App />)
    expect(await screen.findByText(runMessy.target.system)).toBeVisible()
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
