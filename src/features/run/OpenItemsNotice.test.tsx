import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { runClean, runMessyPending } from '../../fixtures'
import { OpenItemsNotice } from './OpenItemsNotice'

describe('OpenItemsNotice', () => {
  it('says how many things are open, and links to the tick list', () => {
    render(<OpenItemsNotice run={runMessyPending} />)
    expect(screen.getByText('3 things to solve')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Jump to the open items →' })).toHaveAttribute(
      'href',
      '#open-items',
    )
  })

  it('shows nothing when nothing is open', () => {
    const { container } = render(<OpenItemsNotice run={runClean} />)
    expect(container).toBeEmptyDOMElement()
  })
})
