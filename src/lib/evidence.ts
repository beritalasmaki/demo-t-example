import { isSystemActor } from './actors'
import { resolveConfidenceAreas } from './confidence'
import { formatConfidenceAreaLabel, formatConfidencePercent, formatCount } from './format'
import { gateForEvent, stepActor } from './steps'
import { noResultLabel } from './gates'
import type { ConfidenceArea, Run, TimelineEvent } from './types'

/**
 * The Evidence tab — every timeline event the page's claims rest on, grouped by what it
 * supports — not UI. See src/lib/README.md. Reading steps (a file opened, a settings check
 * repeated per shard) are not evidence of anything on their own, so they stay in the step list
 * only: a `tool_call` counts here only when it recorded a finding (`detail`).
 */

export type EvidenceKind =
  | 'File change'
  | 'Test run'
  | 'Error'
  | 'Check result'
  | 'Human review'
  | 'Not run'
  | 'Failed check'
  | 'Note'
  | 'Finding'

export interface EvidenceRow {
  event: TimelineEvent
  kind: EvidenceKind
  /** Who produced it — `lib/steps.ts`'s `stepActor`. */
  actor: string
  /** A check that did not run or failed, an error, or a warning — highlighted in the list. */
  attention: boolean
}

export interface EvidenceGroup {
  id: 'code' | 'tests' | 'checks' | 'findings'
  title: string
  /** "6 files changed · 81% implementation" — which claims on the page this group supports. */
  supports: string
  /** True when `supports` names a check that did not run or failed — shown in the warning
   * colour, the same way the header's "Checks" field is. */
  supportsAttention: boolean
  rows: EvidenceRow[]
}

function kindFor(event: TimelineEvent, run: Run): EvidenceKind {
  const gate = gateForEvent(event, run.gates)
  if (gate) {
    if (gate.result === 'unknown') return 'Not run'
    if (gate.result === 'fail') return 'Failed check'
    return isSystemActor(gate.evaluatedBy) ? 'Check result' : 'Human review'
  }
  switch (event.type) {
    case 'file_change':
      return 'File change'
    case 'test_run':
      return 'Test run'
    case 'error':
      return 'Error'
    case 'note':
      return 'Note'
    default:
      return 'Finding'
  }
}

function row(event: TimelineEvent, run: Run): EvidenceRow {
  const kind = kindFor(event, run)
  return {
    event,
    kind,
    actor: stepActor(event, run),
    attention:
      kind === 'Not run' ||
      kind === 'Failed check' ||
      event.type === 'error' ||
      event.severity === 'warning' ||
      event.severity === 'error',
  }
}

export function buildEvidenceGroups(run: Run): EvidenceGroup[] {
  const areas = resolveConfidenceAreas(run.confidence)
  const score = (area: ConfidenceArea['area']) => {
    const found = areas.find((resolved) => resolved.area === area)
    const label = formatConfidenceAreaLabel(area).toLowerCase()
    return found && !found.missing
      ? `${formatConfidencePercent(found.value)} ${label}`
      : `no ${label} score`
  }
  const byType = (...types: TimelineEvent['type'][]) =>
    run.timeline.filter((event) => types.includes(event.type))

  const files = byType('file_change')
  const tests = byType('test_run', 'error')
  const checks = byType('gate_eval')
  const findings = run.timeline.filter(
    (event) => event.type === 'note' || (event.type === 'tool_call' && event.detail),
  )

  const passed = run.gates.filter((gate) => gate.result === 'pass').length
  const notRun = run.gates.filter((gate) => gate.result === 'unknown').length
  const failed = run.gates.filter((gate) => gate.result === 'fail').length
  const checkParts = [`${passed} passed`]
  if (failed > 0) checkParts.push(`${failed} failed`)
  if (notRun > 0) checkParts.push(`${notRun} ${noResultLabel(run.status)}`)

  const groups: EvidenceGroup[] = [
    {
      id: 'code',
      title: 'The code change',
      supports: `${formatCount(files.length, 'file')} changed · ${score('implementation')}`,
      supportsAttention: false,
      rows: files.map((event) => row(event, run)),
    },
    {
      id: 'tests',
      title: 'Tests',
      supports: `${formatCount(tests.filter((event) => event.type === 'test_run').length, 'test run')} · ${score('tests')}`,
      supportsAttention: false,
      rows: tests.map((event) => row(event, run)),
    },
    {
      id: 'checks',
      title: 'Policy checks',
      supports: `${checkParts.join(' · ')} · ${score('security')}`,
      supportsAttention: failed + notRun > 0,
      rows: checks.map((event) => row(event, run)),
    },
    {
      id: 'findings',
      title: 'Findings and side effects',
      supports: score('side_effects'),
      supportsAttention: false,
      rows: findings.map((event) => row(event, run)),
    },
  ]
  return groups.filter((group) => group.rows.length > 0)
}
