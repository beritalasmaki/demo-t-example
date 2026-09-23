import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Decision } from '../../lib/types'
import { useUndoActive } from './useUndoActive'

const decisionAt = (at: Date): Decision => ({
  outcome: 'approved',
  by: 'Juhani Virtaleppäsoutu',
  at: at.toISOString(),
  acknowledgedItemIds: [],
  revision: 'e91a4c',
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useUndoActive', () => {
  it('is false with no decision', () => {
    const { result } = renderHook(() => useUndoActive(undefined))
    expect(result.current).toBe(false)
  })

  it('turns false by itself when the window closes', () => {
    vi.useFakeTimers()
    const decision = decisionAt(new Date(Date.now() - 9 * 60_000))
    const { result } = renderHook(() => useUndoActive(decision))
    expect(result.current).toBe(true)

    act(() => {
      vi.advanceTimersByTime(61_000)
    })
    expect(result.current).toBe(false)
  })
})
