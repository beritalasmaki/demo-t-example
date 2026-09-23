import { afterEach, describe, expect, it, vi } from 'vitest'
import { spotlight } from './spotlight'

describe('spotlight', () => {
  afterEach(() => vi.useRealTimers())

  it('marks the element, then clears it when the animation ends', () => {
    const element = document.createElement('div')
    spotlight(element)
    expect(element).toHaveAttribute('data-spotlight')
    element.dispatchEvent(new Event('animationend'))
    expect(element).not.toHaveAttribute('data-spotlight')
  })

  it('clears it anyway if the animation never runs', () => {
    vi.useFakeTimers()
    const element = document.createElement('div')
    spotlight(element, 1000)
    vi.advanceTimersByTime(1000)
    expect(element).not.toHaveAttribute('data-spotlight')
  })
})
