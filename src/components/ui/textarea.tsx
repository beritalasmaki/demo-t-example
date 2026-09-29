import * as React from 'react'
import { cn } from '@/lib/utils'
import { fieldClassName } from '@/components/ui/input'

/* shadcn/ui's Textarea, restyled onto this project's tokens (docs/DECISIONS.md, 0070). */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldClassName, 'w-full resize-y leading-relaxed', className)}
      {...props}
    />
  )
}

export { Textarea }
