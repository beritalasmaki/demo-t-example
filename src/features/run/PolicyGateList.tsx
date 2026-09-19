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

export function PolicyGateList({ gates, timeline, isLoading = false }: PolicyGateListProps) {
  if (isLoading) {
    return (
      <p role="status" className="text-text-secondary">
        Loading policy checks…
      </p>
    )
  }

  if (gates.length === 0) {
    return <p className="text-text-secondary">No policy checks yet.</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      {sortGates(gates).map((gate) => (
        <PolicyGateRow key={gate.id} gate={gate} timeline={timeline} />
      ))}
    </ul>
  )
}
