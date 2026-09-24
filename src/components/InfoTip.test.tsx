import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { InfoTip } from './InfoTip'

describe('InfoTip', () => {
  it('names its button after the label and describes it with the tip', () => {
    render(<InfoTip label="Open items">Things the run could not finish or check.</InfoTip>)
    const button = screen.getByRole('button', { name: 'About Open items' })
    expect(button).toHaveAccessibleDescription('Things the run could not finish or check.')
  })

  it('hides on Escape, and can show again after focus leaves', async () => {
    const user = userEvent.setup()
    render(<InfoTip label="Run type">Where the run stands.</InfoTip>)
    const button = screen.getByRole('button', { name: 'About Run type' })
    await user.tab()
    expect(button).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(button.parentElement).toHaveAttribute('data-dismissed')
    await user.tab()
    expect(button.parentElement).not.toHaveAttribute('data-dismissed')
  })
})
