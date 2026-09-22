import { Check, ChevronDown, Filter } from 'lucide-react'
import { DropdownMenu } from 'radix-ui'
import type { TimelineEvent } from '../../lib/types'

/** Region 4: "Filterable by event type." Selecting a type here never actually hides an
 * error or a retry of that type — see lib/timeline.ts's filterTimeline, which Timeline uses
 * to enforce that, and TimelineEventRow's "Shown despite the active filters" note.
 *
 * `hiddenTypes` (not `activeTypes`): nothing is hidden by default, and selecting a type in
 * this dropdown hides it — the inverse of the old chip row's "checked = shown". Matches the
 * "N selected" trigger label reading as an exception state (something is being hidden), not
 * the default. */
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
  hiddenTypes: ReadonlySet<TimelineEvent['type']>
  onHiddenTypesChange: (types: Set<TimelineEvent['type']>) => void
}

export function TimelineFilters({ hiddenTypes, onHiddenTypesChange }: TimelineFiltersProps) {
  function setTypeHidden(type: TimelineEvent['type'], hidden: boolean) {
    const next = new Set(hiddenTypes)
    if (hidden) {
      next.add(type)
    } else {
      next.delete(type)
    }
    onHiddenTypesChange(next)
  }

  return (
    <div className="flex flex-wrap items-center gap-[var(--space-2)]">
      {/* "Hide events" is a plain label, not part of the trigger's own text — the trigger
       * itself is just the bordered "N selected" box, matching the mockup's two-piece
       * layout instead of folding the label into the button. */}
      <span className="flex items-center gap-[var(--space-2)] text-item-title font-semibold font-body text-text-primary">
        <Filter aria-hidden className="h-4 w-4 shrink-0 text-text-secondary" />
        Hide events
      </span>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="inline-flex w-fit items-center gap-[var(--space-2)] rounded-md border border-border bg-surface px-[var(--space-3)] py-[var(--space-2)] text-body font-normal font-body text-text-primary hover:border-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            {hiddenTypes.size === 0 ? 'None selected' : `${hiddenTypes.size} selected`}
            <ChevronDown aria-hidden className="h-4 w-4 shrink-0 text-text-secondary" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={4}
            className="z-10 flex min-w-48 flex-col gap-[var(--space-1)] rounded-md border border-border bg-surface p-[var(--space-2)] shadow-md"
          >
            {ALL_TYPES.map((type) => (
              <DropdownMenu.CheckboxItem
                key={type}
                checked={hiddenTypes.has(type)}
                onCheckedChange={(checked) => setTypeHidden(type, checked)}
                onSelect={(event) => event.preventDefault()}
                className="flex cursor-pointer items-center gap-[var(--space-2)] rounded-sm px-[var(--space-2)] py-[var(--space-1)] text-body font-normal font-body text-text-primary outline-none data-[highlighted]:bg-surface-raised"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-border">
                  <DropdownMenu.ItemIndicator>
                    <Check aria-hidden className="h-3 w-3 text-primary" />
                  </DropdownMenu.ItemIndicator>
                </span>
                {TYPE_LABEL[type]}
              </DropdownMenu.CheckboxItem>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}
