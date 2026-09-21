import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renders as a real checkbox, labelled by its text', () => {
    render(
      <Checkbox checked={false} onCheckedChange={() => {}}>
        I have seen 1 failed check.
      </Checkbox>,
    )
    expect(screen.getByRole('checkbox', { name: 'I have seen 1 failed check.' })).not.toBeChecked()
  })

  it('reflects checked state', () => {
    render(
      <Checkbox checked onCheckedChange={() => {}}>
        I have seen 1 failed check.
      </Checkbox>,
    )
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('is toggled by clicking the label text, not just the box', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <Checkbox checked={false} onCheckedChange={onCheckedChange}>
        I have seen 1 failed check.
      </Checkbox>,
    )
    await user.click(screen.getByText('I have seen 1 failed check.'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('is reachable and toggleable by keyboard alone', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <Checkbox checked={false} onCheckedChange={onCheckedChange}>
        I have seen 1 failed check.
      </Checkbox>,
    )
    await user.tab()
    expect(screen.getByRole('checkbox')).toHaveFocus()
    await user.keyboard(' ')
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })
})
