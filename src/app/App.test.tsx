import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the application shell with a single top-level heading', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'Agent run review' })).toBeVisible()
  })

  it('says plainly that the review screen is not built yet', () => {
    render(<App />)

    expect(screen.getByText(/the screen is not built yet/i)).toBeVisible()
  })
})
