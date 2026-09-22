import { ShieldCheck } from 'lucide-react'
import { Disclosure } from '../../components/Disclosure'
import { IconText } from '../../components/IconText'
import { RegionCard } from '../../components/RegionCard'
import { sortGates } from '../../lib/gates'
import type { GateResult, PolicyGate, TimelineEvent } from '../../lib/types'
import { PolicyGateRow } from './PolicyGateRow'

/** The three results worth surfacing before the rest — same set `lib/gates.ts`'s
 * `gateAttentionGroups` flags for the "Before you rely on this" digest. */
const NEEDS_ATTENTION: ReadonlySet<GateResult> = new Set(['fail', 'waived', 'unknown'])

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
  <>
    <h2 id="policy-gates-heading" className="text-section-heading font-semibold text-text-primary">
      <IconText icon={ShieldCheck}>Policy gates</IconText>
    </h2>
    <p className="text-meta font-normal font-body text-text-secondary">
      The checks this change must pass before release, run automatically or by a person.
    </p>
  </>
)

export function PolicyGateList({ gates, timeline, isLoading = false }: PolicyGateListProps) {
  if (isLoading) {
    return (
      <RegionCard className="flex flex-col gap-[var(--space-3)]">
        {HEADING}
        <p role="status" className="text-body font-normal font-body text-text-secondary">
          Loading policy checks…
        </p>
      </RegionCard>
    )
  }

  if (gates.length === 0) {
    return (
      <RegionCard className="flex flex-col gap-[var(--space-3)]">
        {HEADING}
        <p className="text-body font-normal font-body text-text-secondary">No policy checks yet.</p>
      </RegionCard>
    )
  }

  const sorted = sortGates(gates)
  const attention = sorted.filter((gate) => NEEDS_ATTENTION.has(gate.result))
  const settled = sorted.filter((gate) => !NEEDS_ATTENTION.has(gate.result))

  // Scenario S2 (docs/spec-review-screen.md): "hides what was checked behind a single green
  // summary" is a failure when every gate passed. Nothing is collapsed unless there is
  // something that actually needs attention — the boring, all-pass case renders exactly as it
  // always has, one flat list.
  if (attention.length === 0) {
    return (
      <RegionCard className="flex flex-col gap-[var(--space-3)]">
        {HEADING}
        <ul className="flex flex-col gap-[var(--space-3)]">
          {sorted.map((gate) => (
            <PolicyGateRow key={gate.id} gate={gate} timeline={timeline} />
          ))}
        </ul>
      </RegionCard>
    )
  }

  return (
    <RegionCard className="flex flex-col gap-[var(--space-3)]">
      {HEADING}
      <p className="text-meta font-semibold font-body uppercase tracking-wide text-text-secondary">
        Needs attention · {attention.length}
      </p>
      <ul className="flex flex-col gap-[var(--space-3)]">
        {attention.map((gate) => (
          <PolicyGateRow key={gate.id} gate={gate} timeline={timeline} />
        ))}
      </ul>
      {settled.length > 0 && (
        <Disclosure
          summary={
            <span className="text-item-title font-semibold font-body text-text-secondary">
              Show {settled.length} passed check{settled.length === 1 ? '' : 's'}
            </span>
          }
        >
          <ul className="flex flex-col gap-[var(--space-3)]">
            {settled.map((gate) => (
              <PolicyGateRow key={gate.id} gate={gate} timeline={timeline} />
            ))}
          </ul>
        </Disclosure>
      )}
    </RegionCard>
  )
}
