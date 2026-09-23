import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { runClean, runMessyPending } from '../../fixtures'
import { OpenItemsBox } from './OpenItemsBox'

describe('OpenItemsBox', () => {
  it('says how many things are open, and links to the tick list', () => {
    render(<OpenItemsBox run={runMessyPending} />)
    expect(screen.getByText('3 things are open')).toBeVisible()
    expect(screen.getByText(/2 checks did not run/)).toBeVisible()
    expect(screen.getByRole('link', { name: 'Jump to the open items →' })).toHaveAttribute(
      'href',
      '#open-items',
    )
  })

  it('says so when nothing is open', () => {
    render(<OpenItemsBox run={runClean} />)
    expect(screen.getByText('Nothing is open')).toBeVisible()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
