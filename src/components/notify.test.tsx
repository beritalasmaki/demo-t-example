import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { afterEach, describe, expect, it } from 'vitest'
import { notify } from './notify'
import { Toaster } from './ui/sonner'

describe('notify', () => {
  afterEach(() => {
    toast.dismiss()
  })

  it('announces its message politely, replaces the last one, and closes on request', async () => {
    render(<Toaster />)
    act(() => notify('Archived “Refunds”.'))
    act(() => notify('Request sent to Maarit Kasakallio.'))
    const region = await screen.findByRole('region', { name: /Notifications/ })
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toHaveTextContent('Request sent to Maarit Kasakallio.')
    expect(region).not.toHaveTextContent('Archived')

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(region).not.toHaveTextContent('Request sent'))
  })
})
