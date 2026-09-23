import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { INTRO_SEEN_KEY, INTRO_TIMING, shouldShowIntro } from './intro'
import { WelcomeIntro } from './WelcomeIntro'

const t = INTRO_TIMING
const NAME_MS = 'Berit Alasmäki'.length * t.perChar
const TITLE_MS = 'UX & Product Designer'.length * t.perChar
const TOTAL = t.draw + t.resolve + NAME_MS + t.betweenLines + TITLE_MS + t.madeBy + t.hold + t.fade

beforeEach(() => {
  window.sessionStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('WelcomeIntro', () => {
  it('draws, resolves, types the name and title, shows "Made by", then fades and finishes', () => {
    const onDone = vi.fn()
    render(<WelcomeIntro onDone={onDone} />)
    const overlay = screen.getByTestId('welcome-intro')
    const mark = overlay.querySelector('svg')!
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
    expect(mark).not.toHaveAttribute('data-resolved')

    act(() => {
      vi.advanceTimersByTime(t.draw)
    })
    expect(mark).toHaveAttribute('data-resolved')

    act(() => {
      vi.advanceTimersByTime(t.resolve + 5 * t.perChar)
    })
    expect(overlay).toHaveTextContent('Berit')
    expect(overlay.querySelector('.intro-cursor')).not.toBeNull()

    act(() => {
      vi.advanceTimersByTime(NAME_MS + t.betweenLines + TITLE_MS)
    })
    expect(overlay).toHaveTextContent('UX & Product Designer')
    expect(overlay.querySelector('.intro-made-by')).toHaveAttribute('data-shown')
    expect(overlay.querySelector('.intro-cursor')).toBeNull()

    act(() => {
      vi.advanceTimersByTime(t.madeBy + t.hold)
    })
    expect(overlay).toHaveAttribute('data-phase', 'fade')
    expect(onDone).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(t.fade)
    })
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(window.sessionStorage.getItem(INTRO_SEEN_KEY)).not.toBeNull()
  })

  it('any key skips it at once, and remembers for this visit', () => {
    const onDone = vi.fn()
    render(<WelcomeIntro onDone={onDone} />)
    window.localStorage.setItem(INTRO_SEEN_KEY, 'from the first version')
    fireEvent.keyDown(window, { key: 'a' })
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(window.sessionStorage.getItem(INTRO_SEEN_KEY)).not.toBeNull()
    expect(window.localStorage.getItem(INTRO_SEEN_KEY)).toBeNull()
    act(() => {
      vi.advanceTimersByTime(TOTAL)
    })
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('a click or tap skips it at once', () => {
    const onDone = vi.fn()
    render(<WelcomeIntro onDone={onDone} />)
    fireEvent.pointerDown(screen.getByTestId('welcome-intro'))
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})

describe('shouldShowIntro', () => {
  it('shows once per visit, and tidies away the old permanent flag', () => {
    window.localStorage.setItem(INTRO_SEEN_KEY, 'from the first version')
    expect(shouldShowIntro()).toBe(true)
    window.sessionStorage.setItem(INTRO_SEEN_KEY, 'yes')
    expect(shouldShowIntro()).toBe(false)
    // A new visit starts with an empty sessionStorage.
    window.sessionStorage.clear()
    expect(shouldShowIntro()).toBe(true)
  })

  it('is skipped entirely for reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    )
    expect(shouldShowIntro()).toBe(false)
    vi.unstubAllGlobals()
  })
})
