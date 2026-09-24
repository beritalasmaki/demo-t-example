import { fireEvent, render, screen } from '@testing-library/react'
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

  it('calls onClose when the dialog fires its native close event (Escape, in a real browser)', () => {
    // jsdom has no HTMLDialogElement behaviour at all (confirmed: showModal/close are simply
    // undefined), so there is no way to make a real Escape keypress actually close a <dialog>
    // here. This dispatches the same 'close' event a browser would, to prove this component's
    // own listener wiring works; the real Escape-triggers-it behaviour is a browser feature
    // this project verifies separately, in an actual browser (see docs/WORKLOG.md).
    const onClose = vi.fn()
    render(
      <Modal title="Release revision" onClose={onClose}>
        <p>Body text</p>
      </Modal>,
    )
    fireEvent(screen.getByRole('dialog'), new Event('close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose again just from unmounting after it already closed itself', () => {
    const onClose = vi.fn()
    const { unmount } = render(
      <Modal title="Release revision" onClose={onClose}>
        <p>Body text</p>
      </Modal>,
    )
    fireEvent(screen.getByRole('dialog'), new Event('close'))
    expect(onClose).toHaveBeenCalledTimes(1)
    unmount()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('gives focus back to what opened it when it closes', () => {
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
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus()
  })

  it('leaves focus alone if something outside the dialog took it on purpose', () => {
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
    screen.getByRole('heading', { name: 'Approved' }).focus()
    rerender(<Page open={false} />)
    expect(screen.getByRole('heading', { name: 'Approved' })).toHaveFocus()
  })
})
