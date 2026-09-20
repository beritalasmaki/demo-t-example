import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ToggleChip } from './ToggleChip'

describe('ToggleChip', () => {
  it('reflects its pressed state to assistive tech via aria-pressed', () => {
    render(
      <ToggleChip pressed onPressedChange={() => {}}>
        Errors
      </ToggleChip>,
    )
    expect(screen.getByRole('button', { name: 'Errors' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onPressedChange with the opposite of its current state on click', async () => {
    const user = userEvent.setup()
    const onPressedChange = vi.fn()
    render(
      <ToggleChip pressed={false} onPressedChange={onPressedChange}>
        Errors
      </ToggleChip>,
    )

    await user.click(screen.getByRole('button', { name: 'Errors' }))
    expect(onPressedChange).toHaveBeenCalledWith(true)
  })

  it('is reachable and activatable by keyboard alone', async () => {
    const user = userEvent.setup()
    const onPressedChange = vi.fn()
    render(
      <ToggleChip pressed={false} onPressedChange={onPressedChange}>
        Errors
      </ToggleChip>,
    )

    await user.tab()
    expect(screen.getByRole('button', { name: 'Errors' })).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(onPressedChange).toHaveBeenCalledWith(true)
  })
})
