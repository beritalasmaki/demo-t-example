import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

/**
 * A generic modal, built on native `<dialog>` rather than custom JS. `showModal()` gets a focus trap, Escape-to-close (the native
 * `close` event, wired straight to `onClose`) and top-layer stacking for free. Knows nothing
 * about decisions or any other product concept: the caller supplies the title and body.
 *
 * There is no backdrop-click-to-close: closing is only ever Escape or an explicit action
 * inside the dialog (a real Cancel button, in every caller so far), so a stray click never
 * discards something the reviewer was in the middle of typing.
 *
 * Mount `Modal` to open it, unmount it to close it — there is no `open` prop.
 */
export interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Modal({ title, onClose, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  // Read inside the native `close` listener, never during render — see useRun.ts for why this
  // project's lint rules require a ref's value to be set from an effect, not the render body.
  // What had focus before the dialog opened gets it back when the dialog goes (WCAG 2.4.3).
  // The browser does this itself only on a real `close()`; unmounting — how every caller
  // closes a Modal — skips it, and focus fell to <body> (docs/DECISIONS.md, 0059). Read on the
  // first render, before the dialog exists: read in the effect instead, it proved unreliable
  // in a real browser — focus was sometimes already inside the dialog (`showModal()` moves it
  // there), and focus was never given back.
  const [opener] = useState(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  )
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    // jsdom (Vitest's test environment) has no HTMLDialogElement methods at all, only the
    // `open` attribute — real browsers have had `showModal`/`close` for years. Feature-detect
    // rather than crash every test that renders a Modal, and set `open` directly too: without
    // a working `showModal`, jsdom never sets it, and a `<dialog>` with no `open` attribute
    // has no accessible role at all, so nothing inside it would be queryable in a test.
    // Escape-to-close and the backdrop are verified for real in a browser instead (see
    // docs/WORKLOG.md).
    dialog.showModal?.()
    dialog.open = true
    const handleClose = () => onCloseRef.current()
    dialog.addEventListener('close', handleClose)

    return () => {
      dialog.removeEventListener('close', handleClose)
      // Not dialog.close(): that fires its own 'close' event as a separate queued task, which
      // (confirmed against a real browser) can land *after* React's StrictMode dev-mode
      // double-invoke has already re-run this effect and attached a new listener — the
      // teardown's own close call was then mistaken for a real one, closing the dialog right
      // after it re-opened. Setting `open` directly resets the attribute without dispatching
      // that event; a genuine close (Escape, or a real unmount removing the node outright)
      // never goes through this path.
      dialog.open = false

      // Only if focus is still in the dialog, or lost on <body>: never over a deliberate move,
      // such as the undo box's heading taking focus after a decision.
      const active = document.activeElement
      if (opener?.isConnected && (active === document.body || dialog.contains(active))) {
        opener.focus({ preventScroll: true })
      }
    }
  }, [opener])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={cn(
        'w-full max-w-md rounded-md border border-border-subtle bg-surface p-[var(--space-5)] text-text-primary',
        'backdrop:bg-text-primary/40',
        className,
      )}
    >
      <h2 id={titleId} className="text-section-heading font-semibold">
        {title}
      </h2>
      <div className="mt-[var(--space-4)] flex flex-col gap-[var(--space-4)]">{children}</div>
    </dialog>
  )
}
