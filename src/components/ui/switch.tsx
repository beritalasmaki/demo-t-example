import * as React from 'react'
import { cn } from '@/lib/utils'
import { Switch as SwitchPrimitive } from 'radix-ui'

/*
 * shadcn/ui's Switch (Radix), restyled onto this project's tokens (docs/DECISIONS.md, 0070): a
 * `role="switch"` button, Space or Enter to flip it. Two additions to shadcn's API, for a
 * switch that shows what each side means (the theme switch's sun and moon): `children` are
 * drawn in the track, under the thumb, and `thumbClassName` styles the thumb.
 */
function Switch({
  className,
  thumbClassName,
  children,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & { thumbClassName?: string }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-border',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-surface-raised',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block h-4 w-4 rounded-full border border-border bg-surface shadow-sm',
          'transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
          'data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
          thumbClassName,
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
