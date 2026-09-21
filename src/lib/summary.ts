import { resolveEvidenceIds } from './timeline'
import type { Run, TimelineEvent } from './types'

/**
 * Small domain helpers for the summary (Region 2) — not UI. See src/lib/README.md.
 */

export interface ResolvedSummarySentence {
  text: string
  /** The sentence's `evidenceIds` resolved to real timeline events, in the order given. */
  events: TimelineEvent[]
}

/**
 * docs/spec-review-screen.md, Acceptance criteria (Summary): "Every sentence links to
 * evidence; a sentence with no evidence does not render" and "Never longer than five
 * sentences." A sentence whose ids all fail to resolve (or that has none) is dropped
 * entirely, not shown with an empty link — the same "no claim without a source" rule
 * `lib/gates.ts` already applies to policy gates. The five-sentence cap applies to what is
 * actually rendered, so it is counted after dropping unsupported sentences, not before.
 */
export function resolveSummarySentences(
  summary: Run['summary'],
  timeline: TimelineEvent[],
): ResolvedSummarySentence[] {
  return summary
    .map((sentence) => ({
      text: sentence.text,
      events: resolveEvidenceIds(sentence.evidenceIds, timeline),
    }))
    .filter((sentence) => sentence.events.length > 0)
    .slice(0, 5)
}
