import { EvidenceLink } from '../../components/EvidenceLink'
import { resolveSummarySentences } from '../../lib/summary'
import type { Run, TimelineEvent } from '../../lib/types'

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
 */
export interface RunSummaryProps {
  summary: Run['summary']
  timeline: TimelineEvent[]
  isLoading?: boolean
}

const HEADING = (
  <h2 id="summary-heading" className="text-section-heading font-semibold text-text-primary">
    Summary
  </h2>
)

export function RunSummary({ summary, timeline, isLoading = false }: RunSummaryProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-[var(--space-3)]">
        {HEADING}
        <p role="status" className="text-body font-normal font-body text-text-secondary">
          Loading the summary…
        </p>
      </div>
    )
  }

  const sentences = resolveSummarySentences(summary, timeline)

  if (sentences.length === 0) {
    return (
      <div className="flex flex-col gap-[var(--space-3)]">
        {HEADING}
        <p className="text-body font-normal font-body text-text-secondary">No summary available.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      {HEADING}
      <ul className="flex flex-col gap-[var(--space-3)]">
        {sentences.map((sentence) => (
          <li key={sentence.text} className="flex flex-wrap items-baseline gap-x-[var(--space-2)]">
            <span className="text-body font-normal font-body text-text-primary">
              {sentence.text}
            </span>
            <EvidenceLink
              href={`#timeline-event-${sentence.events[0].id}`}
              label="Evidence"
              count={sentence.events.length}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
