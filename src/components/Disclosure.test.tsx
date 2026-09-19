import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Disclosure } from './Disclosure'

describe('Disclosure', () => {
  it('is closed by default', () => {
    render(<Disclosure summary="Header">Body</Disclosure>)
    expect(screen.getByText('Header').closest('details')).not.toHaveAttribute('open')
  })

  it('can start open', () => {
    render(
      <Disclosure summary="Header" defaultOpen>
        Body
      </Disclosure>,
    )
    expect(screen.getByText('Header').closest('details')).toHaveAttribute('open')
  })

  it('opens on click and keeps focus on the summary, not somewhere else', async () => {
    const user = userEvent.setup()
    render(<Disclosure summary="Header">Body</Disclosure>)

    const summary = screen.getByText('Header').closest('summary')!
    await user.click(summary)

    expect(screen.getByText('Header').closest('details')).toHaveAttribute('open')
    expect(summary).toHaveFocus()
  })

  it('is reachable by Tab alone, as the only focusable element in the row', async () => {
    const user = userEvent.setup()
    render(<Disclosure summary="Header">Body</Disclosure>)

    await user.tab()
    expect(screen.getByText('Header').closest('summary')).toHaveFocus()
  })

  // Not tested here: pressing Enter or Space on a focused <summary> toggles it in every real
  // browser — <summary> has an implicit button role, and that is part of its HTML spec
  // behaviour, not something this component adds. jsdom does not implement it (confirmed:
  // dispatching a keydown does nothing, only .click() toggles), so a test written against
  // jsdom here would either be a false negative or a false confidence in something jsdom
  // never actually exercised. AGENTS.md reserves Playwright, which runs a real browser, for
  // exactly this kind of gap.
})
