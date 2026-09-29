import * as React from 'react'
import { cn } from '@/lib/utils'

/*
 * shadcn/ui's Input, restyled onto this project's tokens (docs/DECISIONS.md, 0070).
 * `fieldClassName` is the same look for a native <select>, which has no shadcn file here.
 */
const fieldClassName = cn(
  'rounded-md border border-border bg-surface px-[var(--space-3)] py-[var(--space-2)] text-body font-body text-text-primary',
  'placeholder:text-text-secondary',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring',
  'disabled:cursor-not-allowed disabled:bg-surface-raised disabled:text-text-disabled',
  'aria-invalid:border-status-fail',
)

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(fieldClassName, 'w-full min-w-0', className)}
      {...props}
    />
  )
}

export { Input, fieldClassName }
