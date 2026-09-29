import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { InfoTip } from './InfoTip'

describe('InfoTip', () => {
  it('names its button after the label and, on focus, describes it with the tip', async () => {
    const user = userEvent.setup()
    render(<InfoTip label="Open items">Things the run could not finish or check.</InfoTip>)
    const button = screen.getByRole('button', { name: 'About Open items' })
    await user.tab()
    expect(button).toHaveFocus()
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Things the run could not finish or check.',
    )
    expect(button).toHaveAccessibleDescription('Things the run could not finish or check.')
  })

  it('hides on Escape, keeping focus, and shows again the next time it gets focus', async () => {
    const user = userEvent.setup()
    render(<InfoTip label="Run type">Where the run stands.</InfoTip>)
    const button = screen.getByRole('button', { name: 'About Run type' })
    await user.tab()
    await screen.findByRole('tooltip')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
    expect(button).toHaveFocus()

    await user.tab()
    await user.tab({ shift: true })
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Where the run stands.')
  })
})
