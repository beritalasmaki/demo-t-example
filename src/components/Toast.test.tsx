import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Toast } from './Toast'

describe('Toast', () => {
  it('announces its message politely and closes on request', async () => {
    const onClose = vi.fn()
    render(<Toast message="Request sent to Maarit Kasakallio." onClose={onClose} />)
    expect(screen.getByRole('status')).toHaveTextContent('Request sent to Maarit Kasakallio.')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
