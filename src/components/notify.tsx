import { CircleCheckIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from './ui/button'

/**
 * A short confirmation at the top of the page ("Request sent to …"), through shadcn's Sonner
 * (`ui/sonner.tsx`, docs/DECISIONS.md 0070): announced politely, and it stays until closed —
 * nothing in it expires while someone reads it. A new one replaces the last. The page shows
 * them where it renders `<Toaster />`.
 *
 * Sonner gives focus back to where it was before the toast list whenever focus leaves the list
 * — meant for its Alt+T shortcut, but for someone tabbing through the page it was a loop: Tab
 * out of the toast jumped back to the control before it. `dismissible: false` makes Sonner skip
 * that for the toast itself, and the body keeps its Close button's focus events to itself, so
 * Tab moves on as it should. Close is how it goes away.
 */
export function notify(message: string) {
  toast.custom(
    (id) => (
      <div
        className="flex w-full items-center gap-[var(--space-4)]"
        onFocus={(event) => event.stopPropagation()}
        onBlur={(event) => event.stopPropagation()}
      >
        <CircleCheckIcon aria-hidden className="h-4 w-4 shrink-0 text-toast-icon" />
        <span className="flex-1">{message}</span>
        <Button
          variant="link"
          size="inline"
          onClick={() => toast.dismiss(id)}
          className="text-toast-link"
        >
          Close
        </Button>
      </div>
    ),
    { id: 'status', duration: Infinity, dismissible: false },
  )
}
