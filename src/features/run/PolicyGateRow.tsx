import type { StatusBadgeTone } from '../../components/StatusBadge'
import { StatusBadge } from '../../components/StatusBadge'
import { Disclosure } from '../../components/Disclosure'
import { explanationFor, resolveEvidence } from '../../lib/gates'
import { formatDateTime, formatGateResultLabel } from '../../lib/format'
import type { GateResult, PolicyGate, TimelineEvent } from '../../lib/types'
import { ActorName } from './ActorName'

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
          <div className="flex flex-wrap items-center gap-x-[var(--space-2)] gap-y-[var(--space-2)]">
            <StatusBadge tone={TONE_BY_RESULT[gate.result]} label={formatGateResultLabel(gate)} />
            <span className="text-item-title font-semibold font-body text-text-primary">
              {gate.name}
            </span>
            <span className="text-body font-normal font-body text-text-secondary">
              {gate.plainLanguage}
            </span>
          </div>
        }
      >
        <div className="flex flex-col gap-[var(--space-2)]">
          {/* The badge above already says "Failed" / "Not run" / etc. — this is the "why", not
           * a restatement of the "what". */}
          {explanation && (
            <p className="text-body font-normal font-body text-text-primary">{explanation}</p>
          )}

          {gate.result === 'waived' && gate.waiver && (
            <div className="rounded-md border border-status-waived bg-surface-raised p-[var(--space-3)]">
              <p className="text-body font-normal font-body text-text-primary">
                Exception granted by{' '}
                <span className="font-semibold">
                  <ActorName name={gate.waiver.by} />
                </span>{' '}
                on {formatDateTime(gate.waiver.at)}.
              </p>
              <p className="text-body mt-[var(--space-1)] font-normal font-body text-text-primary">
                "{gate.waiver.reason}"
              </p>
            </div>
          )}

          <p className="text-meta font-normal font-body text-text-secondary">
            Evaluated by <ActorName name={gate.evaluatedBy} /> —{' '}
            {formatDateTime(gate.evaluatedAt)}
          </p>

          <div className="flex flex-col gap-[var(--space-2)]">
            <p className="text-item-title font-semibold font-body text-text-primary">Evidence</p>
            {evidence.length === 0 ? (
              <p className="text-body font-normal font-body text-text-secondary">
                No evidence available.
              </p>
            ) : (
              <ul className="text-body flex list-disc flex-col gap-[var(--space-2)] pl-5 font-normal font-body text-text-secondary">
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
