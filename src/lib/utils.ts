import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names, letting a later Tailwind class win over an earlier one that
 * sets the same property. This is the helper every shadcn/ui component expects at
 * the `utils` alias in components.json.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
