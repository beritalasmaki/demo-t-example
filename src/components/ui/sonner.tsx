import { CircleCheckIcon, InfoIcon, OctagonXIcon, TriangleAlertIcon } from 'lucide-react'
import type * as React from 'react'
import { cn } from '@/lib/utils'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

/*
 * shadcn/ui's Sonner toaster, restyled onto this project's tokens (docs/DECISIONS.md, 0070).
 * Our toast is the page's inverse in both themes (tokens.css, --color-toast-*), so Sonner's
 * own light/dark switch and stylesheet are not used: `unstyled`, with our classes. Sonner
 * makes the whole list one polite live region, named "Notifications".
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"
      offset="var(--space-7)"
      containerAriaLabel="Notifications"
      // One width for the list and each toast: long messages wrap instead of spilling
      // sideways over the page's header buttons.
      style={{ '--width': 'min(34rem, calc(100vw - 2 * var(--space-4)))' } as React.CSSProperties}
      icons={{
        success: <CircleCheckIcon className="h-4 w-4 text-toast-icon" />,
        info: <InfoIcon className="h-4 w-4" />,
        warning: <TriangleAlertIcon className="h-4 w-4" />,
        error: <OctagonXIcon className="h-4 w-4" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: cn(
            'flex w-full items-center gap-[var(--space-4)] rounded-lg bg-toast-bg px-[var(--space-4)] py-[var(--space-3)] text-body font-medium font-body text-toast-fg shadow-lg',
            // Important: Sonner's own stylesheet sets `outline: 0` outside Tailwind's cascade
            // layers, which would beat these utilities whatever their specificity.
            'focus-visible:outline! focus-visible:outline-2! focus-visible:outline-focus-ring! focus-visible:outline-offset-2',
          ),
          content: 'flex-1',
          icon: 'shrink-0',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
