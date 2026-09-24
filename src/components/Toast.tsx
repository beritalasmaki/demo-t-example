import { Check } from 'lucide-react'

/**
 * A short confirmation at the top of the page ("Request sent to …"). Announced politely
 * (`role="status"`), and it stays until closed: nothing in it expires while someone reads it.
 * Colours are the inverse of the page, from the `--color-toast-*` tokens.
 */
export interface ToastProps {
  message: string
  onClose: () => void
}

export function Toast({ message, onClose }: ToastProps) {
  return (
    <div
      role="status"
      className="fixed top-[var(--space-7)] left-1/2 z-40 flex max-w-[calc(100vw-2*var(--space-4))] -translate-x-1/2 items-center gap-[var(--space-4)] rounded-lg bg-toast-bg px-[var(--space-4)] py-[var(--space-3)] text-body font-medium font-body text-toast-fg shadow-lg"
    >
      <Check aria-hidden className="h-4 w-4 shrink-0 text-toast-icon" strokeWidth={2.5} />
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="cursor-pointer text-meta font-semibold font-heading text-toast-link underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        Close
      </button>
    </div>
  )
}
