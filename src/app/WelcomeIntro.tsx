import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, Ref } from 'react'
import { cn } from '../lib/utils'
import { INTRO_TIMING, markIntroSeen } from './intro'
import { SignatureMark } from './SignatureMark'
import './intro.css'

/**
 * A one-time welcome intro, shown once ever per browser before the app appears
 * (docs/DECISIONS.md, 0048). Decorative, not informational: the page loads underneath from the
 * first moment, so the intro never delays the data, and it is not part of the loading state.
 *
 * Sequence: the signature draws itself in orange (900 ms), resolves to solid ink (200 ms), the
 * name and title type on character by character (40 ms each) with a blinking cursor, "Made by"
 * fades in to the left of the mark, a short hold, then the overlay fades out (500 ms).
 *
 * The name and title form one left-aligned block, centred under the mark, and the title is
 * tracked out to exactly the name's width — measured once the fonts have loaded, so the two
 * edges line up whatever font actually renders.
 *
 * - Shown only while `ledger:intro-seen` is absent from localStorage; the flag is set when the
 *   intro completes or is skipped. No cookies, no backend.
 * - Skipped outright for `prefers-reduced-motion: reduce`.
 * - Any click, tap or key press dismisses it at once. The overlay is `aria-hidden` and holds
 *   no focusable element, so it never traps keyboard focus; the page underneath stays
 *   reachable the whole time.
 */
/** The mark's box, as specified: 200×200. The artwork sits on its bottom edge, near the name. */
const MARK_BOX = 200
const NAME = 'Berit Alasmäki'
const TITLE = 'UX & Product Designer'

type Phase = 'draw' | 'resolve' | 'type' | 'madeBy' | 'fade'

export interface WelcomeIntroProps {
  /** Called once, when the overlay has faded out or was skipped. */
  onDone: () => void
}

export function WelcomeIntro({ onDone }: WelcomeIntroProps) {
  const [phase, setPhase] = useState<Phase>('draw')
  const [nameChars, setNameChars] = useState(0)
  const [titleChars, setTitleChars] = useState(0)
  const finished = useRef(false)
  // Set by the timeline effect; the overlay's pointer handler calls it to skip.
  const skip = useRef<() => void>(() => {})
  const nameRef = useRef<HTMLSpanElement>(null)
  const titleRef = useRef<HTMLSpanElement>(null)
  const [tracking, setTracking] = useState<number | null>(null)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    const timers: number[] = []
    const at = (ms: number, run: () => void) => timers.push(window.setTimeout(run, ms))
    const finish = () => {
      if (finished.current) return
      finished.current = true
      timers.forEach((timer) => window.clearTimeout(timer))
      markIntroSeen()
      onDoneRef.current()
    }

    const t = INTRO_TIMING
    let time = t.draw
    at(time, () => setPhase('resolve'))
    time += t.resolve
    at(time, () => setPhase('type'))
    for (let i = 1; i <= NAME.length; i++) at(time + i * t.perChar, () => setNameChars(i))
    time += NAME.length * t.perChar + t.betweenLines
    for (let i = 1; i <= TITLE.length; i++) at(time + i * t.perChar, () => setTitleChars(i))
    time += TITLE.length * t.perChar
    at(time, () => setPhase('madeBy'))
    time += t.madeBy + t.hold
    at(time, () => setPhase('fade'))
    time += t.fade
    at(time, finish)

    // Skip: any key, anywhere. (Clicks and taps are caught by the overlay itself, below.)
    const onKey = () => finish()
    window.addEventListener('keydown', onKey)
    skip.current = finish
    return () => {
      window.removeEventListener('keydown', onKey)
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  // Title tracking = the width the title lacks, spread over the gaps between its characters.
  useLayoutEffect(() => {
    let cancelled = false
    function fit() {
      const name = nameRef.current
      const title = titleRef.current
      if (!name || !title || cancelled) return
      const previous = title.style.letterSpacing
      title.style.letterSpacing = '0px'
      const natural = title.getBoundingClientRect().width
      title.style.letterSpacing = previous
      const target = name.getBoundingClientRect().width
      if (!natural || !target) return
      setTracking(Math.max(0, (target - natural) / (TITLE.length - 1)))
    }
    fit()
    void document.fonts?.ready.then(fit)
    return () => {
      cancelled = true
    }
  }, [])

  const resolved = phase !== 'draw'
  const typingName = phase === 'type' && nameChars < NAME.length
  const typingTitle = phase === 'type' && nameChars === NAME.length

  return (
    <div
      className="intro-overlay"
      data-phase={phase}
      data-testid="welcome-intro"
      aria-hidden
      onPointerDown={() => skip.current()}
    >
      <div className="flex flex-col items-center gap-[var(--space-3)]">
        <div className="relative">
          <span
            className="intro-made-by absolute right-full mr-[var(--space-4)] -translate-y-1/2 text-caption font-normal font-heading whitespace-nowrap text-intro-muted"
            // Level with the middle of the drawn mark, which sits at the bottom of its box.
            style={{ top: `${MARK_BOX - (MARK_BOX * 101) / 178 / 2}px` }}
            data-shown={phase === 'madeBy' || phase === 'fade' || undefined}
          >
            Made by
          </span>
          <SignatureMark className="intro-mark" size={MARK_BOX} resolved={resolved} bottomAligned />
        </div>
        <div className="flex flex-col items-start gap-[var(--space-2)] font-heading">
          <TypedLine
            full={NAME}
            shown={nameChars}
            cursor={typingName}
            measureRef={nameRef}
            className="text-page-title leading-none font-bold tracking-tight"
          />
          <TypedLine
            full={TITLE}
            shown={titleChars}
            cursor={typingTitle}
            measureRef={titleRef}
            // Letter-spacing also follows the last character; the negative margin takes that
            // back off, so the title's visible right edge meets the name's.
            style={
              tracking == null
                ? { letterSpacing: '0.3em' }
                : { letterSpacing: `${tracking}px`, marginRight: `${-tracking}px` }
            }
            className="text-body leading-none font-normal uppercase"
          />
        </div>
      </div>
    </div>
  )
}

/**
 * One typed line. The full text is laid out invisibly to reserve its width, and the typed part
 * sits on top of it, left-aligned — so the line grows from the left edge of its final position
 * instead of re-centring on every character.
 */
function TypedLine({
  full,
  shown,
  cursor,
  className,
  style,
  measureRef,
}: {
  full: string
  shown: number
  cursor: boolean
  className?: string
  style?: CSSProperties
  /** The invisible full-width copy — what the tracking fit measures. */
  measureRef?: Ref<HTMLSpanElement>
}) {
  return (
    <span className={cn('relative inline-block whitespace-pre', className)} style={style}>
      <span ref={measureRef} className="invisible">
        {full}
      </span>
      <span className="absolute inset-0 text-left">
        {full.slice(0, shown)}
        {cursor && <span className="intro-cursor" />}
      </span>
    </span>
  )
}
