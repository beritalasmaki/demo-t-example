import * as React from 'react'
import { cn } from '@/lib/utils'
import { CircleIcon } from 'lucide-react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'

/*
 * shadcn/ui's RadioGroup (Radix), restyled onto this project's tokens (docs/DECISIONS.md,
 * 0070). Arrow keys move between the choices and select, as with native radios. One addition:
 * `RadioGroupSegment`, a choice drawn as one segment of a segmented control (the report's
 * format), named by its own text.
 */
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid gap-[var(--space-3)]', className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'aspect-square h-4 w-4 shrink-0 cursor-pointer rounded-full border border-border bg-surface text-primary',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        'disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

function RadioGroupSegment({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-segment"
      className={cn(
        'cursor-pointer rounded-md px-[var(--space-4)] py-[var(--space-2)] text-meta font-semibold font-heading whitespace-nowrap text-text-secondary',
        'data-[state=checked]:bg-surface data-[state=checked]:text-text-primary data-[state=checked]:shadow-sm',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus-ring',
        className,
      )}
      {...props}
    />
  )
}

export { RadioGroup, RadioGroupItem, RadioGroupSegment }
