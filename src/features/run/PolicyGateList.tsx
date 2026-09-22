import { CircleAlert, CircleCheckBig, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { IconText } from '../../components/IconText'
import { RegionCard } from '../../components/RegionCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/Tabs'
import { sortGates } from '../../lib/gates'
import type { GateResult, PolicyGate, TimelineEvent } from '../../lib/types'
import { PolicyGateRow } from './PolicyGateRow'

/** The three results worth surfacing before the rest — same set `lib/gates.ts`'s
 * `gateAttentionGroups` flags for the "Before you approve" digest. */
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
  const [tab, setTab] = useState<'attention' | 'passed'>('attention')

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
        <ul className="flex flex-col gap-[var(--space-5)]">
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
      <Tabs value={tab} onValueChange={(value) => setTab(value as 'attention' | 'passed')}>
        {/* -mx-[var(--space-5)]: bleeds the segmented bar to RegionCard's own outer edges
         * (matching the mockup, where the tab row's top/bottom rules and fill span the full
         * card width, not just the content column) — each TabsTrigger's own internal padding
         * re-adds that same space-5 inset so its label still lines up with everything else. */}
        <TabsList className="-mx-[var(--space-5)]">
          <TabsTrigger value="attention" icon={CircleAlert}>
            Needs attention ({attention.length})
          </TabsTrigger>
          <TabsTrigger value="passed" icon={CircleCheckBig} iconClassName="text-status-pass-tint-fg">
            Passed checks ({settled.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="attention" className="pt-[var(--space-3)]">
          <ul className="flex flex-col gap-[var(--space-5)]">
            {attention.map((gate) => (
              <PolicyGateRow key={gate.id} gate={gate} timeline={timeline} />
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="passed" className="pt-[var(--space-3)]">
          <ul className="flex flex-col gap-[var(--space-5)]">
            {settled.map((gate) => (
              <PolicyGateRow key={gate.id} gate={gate} timeline={timeline} />
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </RegionCard>
  )
}
