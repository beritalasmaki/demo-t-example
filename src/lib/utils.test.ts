import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('drops falsy values', () => {
    expect(cn('px-2', false, undefined, null, 'py-1')).toBe('px-2 py-1')
  })

  it('lets the later of two conflicting Tailwind classes win', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

describe('cn with the type scale', () => {
  it('keeps a type-scale size next to a text colour', () => {
    expect(cn('text-meta', 'text-text-secondary')).toBe('text-meta text-text-secondary')
    expect(cn('text-badge-label text-text-primary', 'text-status-pass-tint-fg')).toBe(
      'text-badge-label text-status-pass-tint-fg',
    )
  })

  it('still lets a later size win over an earlier one', () => {
    expect(cn('text-body', 'text-caption')).toBe('text-caption')
  })
})
