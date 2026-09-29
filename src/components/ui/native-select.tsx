import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from 'lucide-react'
import { fieldClassName } from '@/components/ui/input'

/*
 * shadcn/ui's NativeSelect, restyled onto this project's tokens (docs/DECISIONS.md, 0070): a
 * real <select> — the phone's own picker, and a real form control for every assistive
 * technology — drawn like the Input, with shadcn's chevron in place of the browser's arrow.
 */
function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <div
      className="group/native-select relative w-fit has-[select:disabled]:opacity-50"
      data-slot="native-select-wrapper"
    >
      <select
        data-slot="native-select"
        className={cn(
          fieldClassName,
          'w-full min-w-0 cursor-pointer appearance-none pr-[calc(var(--space-6)+var(--space-2))]',
          className,
        )}
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-[var(--space-3)] h-4 w-4 -translate-y-1/2 text-text-secondary select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  )
}

function NativeSelectOption({ className, ...props }: React.ComponentProps<'option'>) {
  return (
    <option
      data-slot="native-select-option"
      className={cn('bg-[Canvas] text-[CanvasText]', className)}
      {...props}
    />
  )
}

function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<'optgroup'>) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn('bg-[Canvas] text-[CanvasText]', className)}
      {...props}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
