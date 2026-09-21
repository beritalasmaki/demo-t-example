import { resolveEvidenceIds } from './timeline'
import type { GateResult, Run, TimelineEvent } from './types'

/**
 * Small domain helpers for the summary (Region 2) — not UI. See src/lib/README.md.
 */

export interface ResolvedSummarySentence {
  text: string
  /** The sentence's `evidenceIds` resolved to real timeline events, in the order given. */
  events: TimelineEvent[]
}

/**
 * What kind of thing a summary sentence is reporting — used to pick an icon in
 * `RunSummary.tsx`, the same way `PolicyGateRow.tsx`'s `TONE_BY_RESULT` picks one for a
 * `GateResult`; this only returns the classification, never an icon or a class name (`lib`
 * knows nothing about the interface — see src/lib/README.md).
 *
 * `Run.summary` has no field saying what kind a sentence is, so this is a heuristic over the
 * text itself, the same category of trade-off as `actors.ts`'s `isSystemActor`: verified
 * against every real sentence across all three fixtures (see summary.test.ts), not proven
 * correct for text this app has never generated. A sentence naming a specific gate outcome
 * reuses that exact `GateResult` value, so it can reuse `PolicyGateRow`'s own icon/colour for
 * that result rather than inventing a second visual language for the same claim. `'change'`
 * (what was done) and `'outcome'` (a count or an all-clear) aren't gate results, so they're
 * not in that type — they're this app's two other sentence shapes.
 */
export type SummarySentenceKind = GateResult | 'change' | 'outcome'

export function classifySummarySentence(text: string): SummarySentenceKind {
  if (/\bnot run\b/i.test(text)) return 'unknown'
  if (/\bdoes not apply\b/i.test(text)) return 'not_applicable'
  if (/\bexception\b/i.test(text)) return 'waived'
  if (/\bfailed\b/i.test(text)) return 'fail'
  if (/\b(passed|passing)\b/i.test(text)) return 'outcome'
  return 'change'
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
