import { confidenceLevel, resolveConfidenceAreas } from './confidence'
import { formatConfidenceAreaLabel, formatConfidencePercent, formatGateResultLabel } from './format'
import type { ConfidenceArea, PolicyGate, Run } from './types'

/**
 * What is still open on a run, and what approving it takes — not UI. See src/lib/README.md.
 *
 * docs/DECISIONS.md, 0040: approving a run means ticking every open item separately, and
 * writing a reason whenever a check failed or did not run. Open items are built from real
 * `gates`/`confidence`/`timeline` data only (AGENTS.md non-negotiable 3) — nothing is invented
 * to read well. Replaces the old "Before you approve" digest (`attention.ts`) and the single
 * sign-off tick (`gates.ts`'s `gateAcknowledgement`), which covered failed and waived gates only.
 */

export type OpenItemKind = 'gates-fail' | 'gates-unknown' | 'gates-waived' | 'confidence' | 'note'

/** Where on the page an open item is shown in full (docs/DECISIONS.md, 0055): a check's card
 * or a score's card in the story, or the note's own row in the step list. */
export type OpenItemTarget =
  | { kind: 'check'; gateId: string; count: number }
  | { kind: 'score'; area: string }
  | { kind: 'step'; eventId: string }

export interface OpenItem {
  /** Stable, and what `Decision.acknowledgedItemIds` records. */
  id: string
  kind: OpenItemKind
  /** The sentence next to the tick: "Licensing and accessibility checks did not run." */
  text: string
  target: OpenItemTarget
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1)
}

/** "Open-source licensing and accessibility" — gate names joined as one phrase. */
function joinNames(gates: PolicyGate[]): string {
  const names = gates.map((gate, index) => (index === 0 ? gate.name : lowerFirst(gate.name)))
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

function gateItems(run: Run): OpenItem[] {
  const failed = run.gates.filter((gate) => gate.result === 'fail')
  const unknown = run.gates.filter((gate) => gate.result === 'unknown')
  const waived = run.gates.filter((gate) => gate.result === 'waived')
  const items: OpenItem[] = []

  if (failed.length > 0) {
    items.push({
      id: 'open-gates-fail',
      kind: 'gates-fail',
      text: `${joinNames(failed)} ${failed.length === 1 ? 'check' : 'checks'} failed.`,
      target: { kind: 'check', gateId: failed[0].id, count: failed.length },
    })
  }
  if (unknown.length > 0) {
    items.push({
      id: 'open-gates-unknown',
      kind: 'gates-unknown',
      text: `${joinNames(unknown)} ${unknown.length === 1 ? 'check' : 'checks'} did not run.`,
      target: { kind: 'check', gateId: unknown[0].id, count: unknown.length },
    })
  }
  if (waived.length > 0) {
    items.push({
      id: 'open-gates-waived',
      kind: 'gates-waived',
      text: `${waived.map((gate) => `${gate.name}: ${formatGateResultLabel(gate)}`).join('. ')}.`,
      target: { kind: 'check', gateId: waived[0].id, count: waived.length },
    })
  }
  return items
}

function lowConfidenceAreas(run: Run): ConfidenceArea[] {
  return run.confidence.filter((area) => confidenceLevel(area.value) === 'low')
}

function confidenceItems(run: Run): OpenItem[] {
  return lowConfidenceAreas(run).map((area) => {
    const lead = `${formatConfidenceAreaLabel(area.area)} score is low (${formatConfidencePercent(area.value)})`
    const first = area.unverified[0]
    return {
      id: `open-confidence-${area.area}`,
      kind: 'confidence' as const,
      text: first ? `${lead}: ${lowerFirst(first)}` : `${lead}.`,
      target: { kind: 'score' as const, area: area.area },
    }
  })
}

/** A note the agent flagged as a warning ("The nightly reconciliation job was not re-run")
 * is a caveat the reviewer accepts by approving. Error events are not repeated here: an error
 * the agent recovered from is part of the run's story, not something left open. */
function noteItems(run: Run): OpenItem[] {
  return run.timeline
    .filter((event) => event.type === 'note' && event.severity === 'warning')
    .map((event) => ({
      id: `open-note-${event.id}`,
      kind: 'note' as const,
      text: event.title,
      target: { kind: 'step' as const, eventId: event.id },
    }))
}

export function buildOpenItems(run: Run): OpenItem[] {
  return [...gateItems(run), ...confidenceItems(run), ...noteItems(run)]
}

/** Gates with no usable result: failed, or never ran. */
export function missingChecks(run: Run): PolicyGate[] {
  return run.gates.filter((gate) => gate.result === 'fail' || gate.result === 'unknown')
}

/** docs/DECISIONS.md, 0040: an approval needs a written reason whenever a check failed or
 * did not run. `lib/api.ts`'s `submitDecision` enforces the same rule. */
export function approvalNeedsReason(run: Run): boolean {
  return missingChecks(run).length > 0
}

export type UnverifiedSeverity = 'open' | 'minor'

export interface UnverifiedItem {
  id: string
  text: string
  /** `open`: a check that did not run or failed, or something a Low score could not verify.
   * `minor`: something a Medium score could not verify, an exception, or an area with no
   * score at all. High scores' gaps stay on their own score card only. */
  severity: UnverifiedSeverity
}

/**
 * "What is not checked" (before a decision) / "What is still unverified" (after one) — the
 * list a reviewer accepts by approving, and the list someone copies into a report later.
 */
export function buildUnverifiedItems(run: Run): UnverifiedItem[] {
  const items: UnverifiedItem[] = []

  for (const gate of missingChecks(run)) {
    items.push({
      id: `unverified-gate-${gate.id}`,
      text: `${gate.name} — ${lowerFirst(formatGateResultLabel(gate))}`,
      severity: 'open',
    })
  }

  for (const area of resolveConfidenceAreas(run.confidence)) {
    if (area.missing) {
      items.push({
        id: `unverified-area-${area.area}`,
        text: `${formatConfidenceAreaLabel(area.area)} — the agent gave no score`,
        severity: 'minor',
      })
      continue
    }
    const level = confidenceLevel(area.value)
    if (level === 'high') continue
    area.unverified.forEach((text, index) => {
      items.push({
        id: `unverified-area-${area.area}-${index}`,
        text,
        severity: level === 'low' ? 'open' : 'minor',
      })
    })
  }

  for (const gate of run.gates.filter((gate) => gate.result === 'waived')) {
    items.push({
      id: `unverified-gate-${gate.id}`,
      text: `${gate.name} — ${lowerFirst(formatGateResultLabel(gate))}`,
      severity: 'minor',
    })
  }

  // Open first, then minor — a stable sort keeps each group's own order.
  return items.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'open' ? -1 : 1))
}
