import { useEffect, useRef, useState } from 'react'
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
 * - Shown only while `ledger:intro-seen` is absent from localStorage; the flag is set when the
 *   intro completes or is skipped. No cookies, no backend.
 * - Skipped outright for `prefers-reduced-motion: reduce`.
 * - Any click, tap or key press dismisses it at once. The overlay is `aria-hidden` and holds
 *   no focusable element, so it never traps keyboard focus; the page underneath stays
 *   reachable the whole time.
 */
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
      <div className="flex flex-col items-center gap-[var(--space-5)]">
        <div className="relative">
          <span
            className="intro-made-by absolute top-1/2 right-full mr-[var(--space-4)] -translate-y-1/2 text-caption font-normal font-heading whitespace-nowrap text-intro-muted"
            data-shown={phase === 'madeBy' || phase === 'fade' || undefined}
          >
            Made by
          </span>
          <SignatureMark className="intro-mark" size={200} resolved={resolved} />
        </div>
        <div className="flex flex-col items-center gap-[var(--space-2)] font-heading">
          <TypedLine
            full={NAME}
            shown={nameChars}
            cursor={typingName}
            className="text-page-title leading-none font-bold tracking-tight"
          />
          <TypedLine
            full={TITLE}
            shown={titleChars}
            cursor={typingTitle}
            className="text-caption leading-none font-medium tracking-[0.3em] uppercase"
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
}: {
  full: string
  shown: number
  cursor: boolean
  className?: string
}) {
  return (
    <span className={cn('relative inline-block whitespace-pre', className)}>
      <span className="invisible">{full}</span>
      <span className="absolute inset-0 text-left">
        {full.slice(0, shown)}
        {cursor && <span className="intro-cursor" />}
      </span>
    </span>
  )
}
