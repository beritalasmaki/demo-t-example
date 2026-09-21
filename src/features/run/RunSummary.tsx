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

export function RunSummary({ summary, timeline, isLoading = false }: RunSummaryProps) {
  if (isLoading) {
    return (
      <p role="status" className="text-text-secondary">
        Loading the summary…
      </p>
    )
  }

  const sentences = resolveSummarySentences(summary, timeline)

  if (sentences.length === 0) {
    return <p className="text-text-secondary">No summary available.</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      {sentences.map((sentence) => (
        <li key={sentence.text} className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-text-primary">{sentence.text}</span>
          <EvidenceLink
            href={`#timeline-event-${sentence.events[0].id}`}
            label="Evidence"
            count={sentence.events.length}
          />
        </li>
      ))}
    </ul>
  )
}
