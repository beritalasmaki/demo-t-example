import type { StatusBadgeTone } from '../../components/StatusBadge'
import { StatusBadge } from '../../components/StatusBadge'
import { Disclosure } from '../../components/Disclosure'
import { explanationFor, resolveEvidence } from '../../lib/gates'
import { formatDateTime, formatGateResultLabel } from '../../lib/format'
import type { GateResult, PolicyGate, TimelineEvent } from '../../lib/types'

/**
 * One policy gate. See docs/spec-review-screen.md, Region 3 and "Hierarchy and disclosure":
 * first the result and the rule in plain language (the always-visible summary), then what
 * broke it and who evaluated it (the expandable body) — a failed result or an exception is
 * never itself hidden, only the detail behind it is collapsed.
 */
const TONE_BY_RESULT: Record<GateResult, StatusBadgeTone> = {
  pass: 'success',
  fail: 'danger',
  waived: 'warning',
  not_applicable: 'neutral',
  unknown: 'info',
}

export interface PolicyGateRowProps {
  gate: PolicyGate
  timeline: TimelineEvent[]
  defaultOpen?: boolean
}

export function PolicyGateRow({ gate, timeline, defaultOpen = false }: PolicyGateRowProps) {
  const explanation = explanationFor(gate, timeline)
  const evidence = resolveEvidence(gate, timeline)

  return (
    <li>
      <Disclosure
        defaultOpen={defaultOpen}
        summary={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusBadge tone={TONE_BY_RESULT[gate.result]} label={formatGateResultLabel(gate)} />
            <span className="font-medium text-text-primary">{gate.name}</span>
            <span className="text-sm text-text-secondary">{gate.plainLanguage}</span>
          </div>
        }
      >
        <div className="flex flex-col gap-3 text-sm">
          {/* The badge above already says "Failed" / "Not run" / etc. — this is the "why", not
           * a restatement of the "what". */}
          {explanation && <p className="text-text-primary">{explanation}</p>}

          {gate.result === 'waived' && gate.waiver && (
            <div className="rounded-md border border-status-waived bg-surface-raised p-3">
              <p className="text-text-primary">
                <span className="font-medium">Exception granted by {gate.waiver.by}</span> on{' '}
                {formatDateTime(gate.waiver.at)}.
              </p>
              <p className="mt-1 text-text-primary">"{gate.waiver.reason}"</p>
            </div>
          )}

          <p className="text-text-secondary">
            Evaluated by {gate.evaluatedBy} — {formatDateTime(gate.evaluatedAt)}
          </p>

          <div>
            <p className="font-medium text-text-primary">Evidence</p>
            {evidence.length === 0 ? (
              <p className="text-text-secondary">No evidence available.</p>
            ) : (
              <ul className="mt-1 list-disc pl-5 text-text-secondary">
                {evidence.map((event) => (
                  <li key={event.id}>{event.title}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Disclosure>
    </li>
  )
}
