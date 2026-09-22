import { CircleCheckBig, CircleHelp, CircleMinus, CircleX, TriangleAlert } from 'lucide-react'
import { cn } from '../lib/utils'

/**
 * A generic status badge: icon + text, never colour alone. Knows nothing about runs or
 * policy gates — `tone` is a plain semantic colour, not a `GateResult`. The caller (in
 * `features/run/`, for a policy gate) maps its own domain values onto one of these tones.
 *
 * The icon is fixed per tone inside this component, not a prop: a caller cannot render a
 * status with colour but no icon, because there is no way to ask for one without the other.
 *
 * `success` and `warning` are filled (a light tint background, `--color-status-*-tint-fg`
 * for icon/border/text) — the one deliberate exception to "status colour is never a fill,
 * never the text" (src/styles/README.md), scoped to exactly these two tones because only
 * green and light-yellow tint tokens exist (docs/DECISIONS.md). `danger`/`neutral`/`info`
 * stay icon-and-border-only, unchanged. `info` (the only `GateResult` it renders,
 * `unknown`/"Not run") uses a plain neutral colour rather than `--color-status-unknown`
 * (blue) — see docs/DECISIONS.md for why.
 */
export type StatusBadgeTone = 'success' | 'danger' | 'warning' | 'neutral' | 'info'

const TONE = {
  success: {
    icon: CircleCheckBig,
    className: 'border-transparent bg-status-pass-tint-bg text-status-pass-tint-fg',
  },
  danger: { icon: CircleX, className: 'text-status-fail border-status-fail' },
  warning: {
    icon: TriangleAlert,
    className: 'border-transparent bg-status-waived-tint-bg text-status-waived-tint-fg',
  },
  neutral: {
    icon: CircleMinus,
    className: 'text-status-not-applicable border-status-not-applicable',
  },
  info: { icon: CircleHelp, className: 'text-text-secondary border-border' },
} satisfies Record<
  StatusBadgeTone,
  { icon: React.ComponentType<{ className?: string }>; className: string }
>

export interface StatusBadgeProps {
  tone: StatusBadgeTone
  label: string
  className?: string
}

export function StatusBadge({ tone, label, className }: StatusBadgeProps) {
  const { icon: Icon, className: toneClassName } = TONE[tone]

  return (
    <span
      className={cn(
        'text-badge-label inline-flex items-center gap-[var(--space-2)] rounded-full border bg-surface-raised px-[var(--space-3)] py-[var(--space-1)] font-semibold font-heading text-text-primary',
        toneClassName,
        className,
      )}
    >
      <Icon aria-hidden className="h-4 w-4 shrink-0" />
      {label}
    </span>
  )
}
