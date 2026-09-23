import { formatGateResultLabel } from './format'
import type { PolicyGate, Run, TimelineEvent } from './types'

/**
 * The "All N steps" tab — the full audit log as one row per step — not UI. See
 * src/lib/README.md.
 */

export type StepRow =
  | { kind: 'step'; number: number; event: TimelineEvent }
  | {
      kind: 'group'
      /** Number of the first step in the group, 1-based. */
      firstNumber: number
      events: TimelineEvent[]
    }

/** Titles that differ only by their numbers ("...shard-001.", "...shard-002.") describe the
 * same action repeated. */
function shape(event: TimelineEvent): string {
  return `${event.type}|${event.title.replace(/\d+/g, '#')}`
}

/**
 * Folds a long run of the same repeated step into one row (180 shard checks become one row that
 * opens), so the table stays readable. Nothing is removed: a group keeps every event it holds,
 * and the row says how many (docs/spec-review-screen.md: "collapsed, and the collapse says how
 * much is inside"). Only runs of `minRun` or more fold, and never errors, retries or warnings —
 * those always stay their own row.
 */
export function foldSteps(timeline: TimelineEvent[], minRun = 10): StepRow[] {
  const rows: StepRow[] = []
  let index = 0

  while (index < timeline.length) {
    const event = timeline[index]
    let end = index + 1
    if (!event.severity && event.type !== 'error') {
      while (
        end < timeline.length &&
        !timeline[end].severity &&
        shape(timeline[end]) === shape(event)
      ) {
        end++
      }
    }

    if (end - index >= minRun) {
      rows.push({ kind: 'group', firstNumber: index + 1, events: timeline.slice(index, end) })
    } else {
      for (let i = index; i < end; i++) {
        rows.push({ kind: 'step', number: i + 1, event: timeline[i] })
      }
    }
    index = end
  }
  return rows
}

/** "001", "011–190": step numbers padded to the run's own length, so the column lines up. */
export function formatStepNumber(first: number, total: number, last?: number): string {
  const width = String(total).length
  const pad = (n: number) => String(n).padStart(width, '0')
  return last != null && last !== first ? `${pad(first)}–${pad(last)}` : pad(first)
}

/** The gate a `gate_eval` event reports on, if any: the gate that lists it as evidence. */
export function gateForEvent(event: TimelineEvent, gates: PolicyGate[]): PolicyGate | undefined {
  if (event.type !== 'gate_eval') return undefined
  return gates.find((gate) => gate.evidenceIds.includes(event.id))
}

/**
 * Who did a step — Content rules, "Who did what": a person by name, or a system by name and
 * version, never "the system". A gate evaluation belongs to whoever evaluated the gate; every
 * other step to the agent.
 */
export function stepActor(event: TimelineEvent, run: Run): string {
  const gate = gateForEvent(event, run.gates)
  if (gate) return gate.evaluatedBy
  return `${run.agent.name} v${run.agent.version}`
}

export type StepResultTone = 'done' | 'attention' | 'failed'

export interface StepResult {
  label: string
  tone: StepResultTone
}

/** The Result column: a gate's own result label for a gate evaluation, "Error" for an error,
 * "Open" for a warning note the agent left, "Done" otherwise. */
export function stepResult(event: TimelineEvent, run: Run): StepResult {
  const gate = gateForEvent(event, run.gates)
  if (gate) {
    const tone: StepResultTone =
      gate.result === 'fail' ? 'failed' : gate.result === 'pass' ? 'done' : 'attention'
    return { label: formatGateResultLabel(gate), tone }
  }
  if (event.type === 'error' || event.severity === 'error')
    return { label: 'Error', tone: 'failed' }
  if (event.severity === 'warning') return { label: 'Open', tone: 'attention' }
  return { label: 'Done', tone: 'done' }
}
