import { ToggleChip } from '../../components/ToggleChip'
import type { TimelineEvent } from '../../lib/types'

/** Region 4: "Filterable by event type." Unchecking a type here never actually hides an
 * error or a retry of that type — see lib/timeline.ts's filterTimeline, which Timeline uses
 * to enforce that, and TimelineEventRow's "Shown despite the active filters" note. */
const TYPE_LABEL: Record<TimelineEvent['type'], string> = {
  plan: 'Plan',
  tool_call: 'Tool calls',
  file_change: 'File changes',
  test_run: 'Test runs',
  gate_eval: 'Gate evaluations',
  error: 'Errors',
  note: 'Notes',
}

const ALL_TYPES = Object.keys(TYPE_LABEL) as TimelineEvent['type'][]

export interface TimelineFiltersProps {
  activeTypes: ReadonlySet<TimelineEvent['type']>
  onActiveTypesChange: (types: Set<TimelineEvent['type']>) => void
}

export function TimelineFilters({ activeTypes, onActiveTypesChange }: TimelineFiltersProps) {
  function setTypeActive(type: TimelineEvent['type'], active: boolean) {
    const next = new Set(activeTypes)
    if (active) {
      next.add(type)
    } else {
      next.delete(type)
    }
    onActiveTypesChange(next)
  }

  return (
    <div role="group" aria-label="Filter by event type" className="flex flex-wrap gap-2">
      {ALL_TYPES.map((type) => (
        <ToggleChip
          key={type}
          pressed={activeTypes.has(type)}
          onPressedChange={(pressed) => setTypeActive(type, pressed)}
        >
          {TYPE_LABEL[type]}
        </ToggleChip>
      ))}
    </div>
  )
}
