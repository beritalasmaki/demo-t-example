import { sortGates } from '../../lib/gates'
import type { PolicyGate, TimelineEvent } from '../../lib/types'
import { PolicyGateRow } from './PolicyGateRow'

/**
 * Region 3: the checks a run has to pass. Sorted so failed and exceptions never have to be
 * found — they are always first (docs/spec-review-screen.md, Acceptance criteria: "Failed
 * and waived sort above passed; order stays stable when data updates").
 */
export interface PolicyGateListProps {
  gates: PolicyGate[]
  timeline: TimelineEvent[]
  isLoading?: boolean
}

const HEADING = (
  <h2 id="policy-gates-heading" className="text-section-heading font-semibold text-text-primary">
    Policy gates
  </h2>
)

export function PolicyGateList({ gates, timeline, isLoading = false }: PolicyGateListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-[var(--space-3)]">
        {HEADING}
        <p role="status" className="text-body font-normal font-body text-text-secondary">
          Loading policy checks…
        </p>
      </div>
    )
  }

  if (gates.length === 0) {
    return (
      <div className="flex flex-col gap-[var(--space-3)]">
        {HEADING}
        <p className="text-body font-normal font-body text-text-secondary">No policy checks yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      {HEADING}
      <ul className="flex flex-col gap-[var(--space-3)]">
        {sortGates(gates).map((gate) => (
          <PolicyGateRow key={gate.id} gate={gate} timeline={timeline} />
        ))}
      </ul>
    </div>
  )
}
