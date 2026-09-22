import {
  CircleCheckBig,
  CircleHelp,
  CircleMinus,
  CircleX,
  FileText,
  PencilLine,
  TriangleAlert,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { EvidenceLink } from '../../components/EvidenceLink'
import { IconText } from '../../components/IconText'
import { RegionCard } from '../../components/RegionCard'
import { classifySummarySentence, resolveSummarySentences } from '../../lib/summary'
import type { SummarySentenceKind } from '../../lib/summary'
import type { Run, TimelineEvent } from '../../lib/types'
import { cn } from '../../lib/utils'

/**
 * Region 2: three to five plain sentences, each linked to its evidence. See
 * docs/spec-review-screen.md, Hierarchy and disclosure: "Hidden: nothing — if a sentence
 * needs hiding, it should not be in the summary." `resolveSummarySentences` (lib/summary.ts)
 * is what actually drops an unsupported sentence and caps the list at five; this component
 * only renders what survives that.
 *
 * The evidence link points into the Timeline region (via the anchor id
 * `TimelineEventRow` sets on each row), now that the page composes both regions together —
 * before that, there was nothing for a summary sentence to actually link to.
 *
 * The first (rendered) sentence is the card's headline — bigger, semibold — the rest stay
 * body text. Every sentence gets an icon for its kind (`classifySummarySentence`); a sentence
 * naming a specific gate outcome (failed/exception/not run/does not apply) reuses that exact
 * `GateResult`'s own icon and colour from `PolicyGateRow.tsx`'s `TONE_BY_RESULT`, not a new
 * visual language for the same claim.
 */
export interface RunSummaryProps {
  summary: Run['summary']
  timeline: TimelineEvent[]
  isLoading?: boolean
}

/**
 * `iconClassName` colours only the icon (neutral kinds get a quiet secondary-text icon, the
 * same weight as any other inline icon on the page); `textClassName` is unset (falls back to
 * the sentence's own text-primary/headline styling) for the two neutral kinds, and matches
 * `iconClassName` for the four that reuse a `GateResult`'s own status colour — the request's
 * "uses --color-status-unknown for its icon and text," extended the same way to the other
 * three gate-outcome kinds this app's real sentences also produce.
 */
const KIND_STYLE: Record<
  SummarySentenceKind,
  { icon: ComponentType<{ className?: string }>; iconClassName: string; textClassName?: string }
> = {
  change: { icon: PencilLine, iconClassName: 'text-text-secondary' },
  outcome: { icon: CircleCheckBig, iconClassName: 'text-text-secondary' },
  pass: { icon: CircleCheckBig, iconClassName: 'text-text-secondary' },
  fail: { icon: CircleX, iconClassName: 'text-status-fail', textClassName: 'text-status-fail' },
  waived: {
    icon: TriangleAlert,
    iconClassName: 'text-status-waived',
    textClassName: 'text-status-waived',
  },
  not_applicable: {
    icon: CircleMinus,
    iconClassName: 'text-status-not-applicable',
    textClassName: 'text-status-not-applicable',
  },
  unknown: {
    icon: CircleHelp,
    iconClassName: 'text-status-unknown',
    textClassName: 'text-status-unknown',
  },
}

const HEADING = (
  <h2 id="summary-heading" className="text-section-heading font-semibold text-text-primary">
    <IconText icon={FileText}>Summary</IconText>
  </h2>
)

export function RunSummary({ summary, timeline, isLoading = false }: RunSummaryProps) {
  if (isLoading) {
    return (
      <RegionCard className="flex flex-col gap-[var(--space-3)]">
        {HEADING}
        <p role="status" className="text-body font-normal font-body text-text-secondary">
          Loading the summary…
        </p>
      </RegionCard>
    )
  }

  const sentences = resolveSummarySentences(summary, timeline)

  if (sentences.length === 0) {
    return (
      <RegionCard className="flex flex-col gap-[var(--space-3)]">
        {HEADING}
        <p className="text-body font-normal font-body text-text-secondary">No summary available.</p>
      </RegionCard>
    )
  }

  return (
    <RegionCard className="flex flex-col gap-[var(--space-3)]">
      {HEADING}
      <ul className="flex flex-col gap-[var(--space-3)]">
        {sentences.map((sentence, index) => {
          const kind = classifySummarySentence(sentence.text)
          const { icon, iconClassName, textClassName } = KIND_STYLE[kind]
          const isHeadline = index === 0

          return (
            <li
              key={sentence.text}
              className="flex flex-wrap items-center gap-x-[var(--space-2)] gap-y-[var(--space-1)]"
            >
              {/* items-start, overriding IconText's own items-center: a sentence can wrap to
               * several lines at narrow widths, same reasoning as TimelineEventRow.tsx's
               * identical override. */}
              <IconText icon={icon} iconClassName={iconClassName} className="items-start">
                <span
                  className={cn(
                    'font-body',
                    isHeadline ? 'text-item-title font-semibold' : 'text-body font-normal',
                    textClassName ?? 'text-text-primary',
                  )}
                >
                  {sentence.text}
                </span>
              </IconText>
              <EvidenceLink
                href={`#timeline-event-${sentence.events[0].id}`}
                label="Evidence"
                count={sentence.events.length}
              />
            </li>
          )
        })}
      </ul>
    </RegionCard>
  )
}
