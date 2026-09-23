import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
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

  it('scrolls to the tick list and spotlights it', async () => {
    const list = document.createElement('fieldset')
    list.id = 'open-items'
    const scrollIntoView = vi.fn()
    list.scrollIntoView = scrollIntoView
    document.body.append(list)
    render(<OpenItemsNotice run={runMessyPending} />)
    await userEvent.click(screen.getByRole('link', { name: 'Jump to the open items →' }))
    expect(scrollIntoView).toHaveBeenCalled()
    expect(list).toHaveAttribute('data-spotlight')
    list.remove()
  })

  it('shows nothing when nothing is open', () => {
    const { container } = render(<OpenItemsNotice run={runClean} />)
    expect(container).toBeEmptyDOMElement()
  })
})
