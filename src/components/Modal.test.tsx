import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

describe('Modal', () => {
  it('shows the title and body', () => {
    render(
      <Modal title="Release revision" onClose={() => {}}>
        <p>Body text</p>
      </Modal>,
    )
    expect(screen.getByRole('heading', { name: 'Release revision' })).toBeVisible()
    expect(screen.getByText('Body text')).toBeVisible()
  })

  it('labels the dialog with its title for assistive tech', () => {
    render(
      <Modal title="Release revision" onClose={() => {}}>
        <p>Body text</p>
      </Modal>,
    )
    const dialog = screen.getByRole('dialog')
    const heading = screen.getByRole('heading', { name: 'Release revision' })
    expect(dialog).toHaveAttribute('aria-labelledby', heading.id)
  })

  it('calls onClose on Escape', () => {
    const onClose = vi.fn()
    render(
      <Modal title="Release revision" onClose={onClose}>
        <p>Body text</p>
      </Modal>,
    )
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close on a click outside it, so a half-typed reason is never lost', () => {
    const onClose = vi.fn()
    render(
      <Modal title="Release revision" onClose={onClose}>
        <p>Body text</p>
      </Modal>,
    )
    fireEvent.pointerDown(document.body)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not call onClose just from unmounting', () => {
    const onClose = vi.fn()
    const { unmount } = render(
      <Modal title="Release revision" onClose={onClose}>
        <p>Body text</p>
      </Modal>,
    )
    unmount()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('gives focus back to what opened it when it closes', async () => {
    function Page({ open }: { open: boolean }) {
      return (
        <>
          <button type="button">Open</button>
          {open && (
            <Modal title="Reject run" onClose={vi.fn()}>
              <button type="button">Cancel</button>
            </Modal>
          )}
        </>
      )
    }
    const { rerender } = render(<Page open={false} />)
    screen.getByRole('button', { name: 'Open' }).focus()
    rerender(<Page open />)
    screen.getByRole('button', { name: 'Cancel' }).focus()
    rerender(<Page open={false} />)
    // Radix gives focus back a tick after the dialog goes.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus())
  })

  it('leaves focus alone if something outside the dialog took it on purpose', async () => {
    function Page({ open }: { open: boolean }) {
      return (
        <>
          <button type="button">Open</button>
          <h2 tabIndex={-1}>Approved</h2>
          {open && (
            <Modal title="Approve" onClose={vi.fn()}>
              <p>Body</p>
            </Modal>
          )}
        </>
      )
    }
    const { rerender } = render(<Page open={false} />)
    screen.getByRole('button', { name: 'Open' }).focus()
    rerender(<Page open />)
    // As on the page: the dialog goes, then the undo box's heading takes focus in an effect,
    // before the dialog's own focus return runs.
    rerender(<Page open={false} />)
    screen.getByRole('heading', { name: 'Approved' }).focus()
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(screen.getByRole('heading', { name: 'Approved' })).toHaveFocus()
  })
})
