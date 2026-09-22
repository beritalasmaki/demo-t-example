import { CircleHelp, Gauge } from 'lucide-react'
import { Disclosure } from '../../components/Disclosure'
import { IconText } from '../../components/IconText'
import { RegionCard } from '../../components/RegionCard'
import { resolveConfidenceAreas } from '../../lib/confidence'
import { formatConfidenceAreaLabel, formatConfidencePercent } from '../../lib/format'
import type { ConfidenceArea } from '../../lib/types'

/**
 * Region 5: per area, how sure the model is and what it could not verify. See
 * docs/spec-review-screen.md, Hierarchy and disclosure — "First: what the model could not
 * verify. Second: the value and its basis. Hidden until opened: the model's longer
 * reasoning. Never hidden: an area with no confidence value at all." `resolveConfidenceAreas`
 * (lib/confidence.ts) is what turns `Run.confidence` — which simply omits an area the model
 * didn't report — into the fixed, always-complete list this component renders; this
 * component only renders what that returns.
 *
 * No colour-by-value: "Low confidence is normal and should look normal, not alarming." The
 * only tone used here is `--color-status-unknown`, for "Not checked" — reusing Policy gates'
 * own `unknown` treatment, not a new one.
 */
export interface ConfidencePanelProps {
  confidence: ConfidenceArea[]
  isLoading?: boolean
}

const HEADING = (
  <>
    <h2 id="confidence-heading" className="text-section-heading font-semibold text-text-primary">
      <IconText icon={Gauge}>Confidence</IconText>
    </h2>
    <p className="text-meta font-normal font-body text-text-secondary">
      How sure the model is about its own work, and what it could not check.
    </p>
  </>
)

export function ConfidencePanel({ confidence, isLoading = false }: ConfidencePanelProps) {
  if (isLoading) {
    return (
      <RegionCard className="flex flex-col gap-[var(--space-3)]">
        {HEADING}
        <p role="status" className="text-body font-normal font-body text-text-secondary">
          Loading confidence…
        </p>
      </RegionCard>
    )
  }

  return (
    <RegionCard className="flex flex-col gap-[var(--space-3)]">
      {HEADING}
      <ul className="flex flex-col gap-[var(--space-3)]">
        {resolveConfidenceAreas(confidence).map((area) =>
          area.missing ? (
            <li
              key={area.area}
              className="rounded-md border border-border-subtle bg-surface px-[var(--space-4)] py-[var(--space-3)]"
            >
              <div className="flex flex-wrap items-center gap-x-[var(--space-2)] gap-y-[var(--space-2)]">
                <span className="text-item-title font-semibold font-body text-text-primary">
                  {formatConfidenceAreaLabel(area.area)}
                </span>
                <IconText icon={CircleHelp} iconClassName="text-status-unknown">
                  <span className="text-body font-normal font-body text-status-unknown">
                    Not checked
                  </span>
                </IconText>
              </div>
            </li>
          ) : (
            <li key={area.area}>
              <Disclosure
                summary={
                  <div className="flex flex-col gap-[var(--space-2)]">
                    <div className="flex items-center justify-between gap-[var(--space-3)]">
                      <span className="text-item-title font-semibold font-body text-text-primary">
                        {formatConfidenceAreaLabel(area.area)}
                      </span>
                      {/* An at-a-glance addition, not a replacement for the full "Confidence
                       * X% — basis" sentence below — same value, shown twice on purpose.
                       * Neutral surface/border tokens, not a status colour: this isn't a
                       * pass/fail claim, so it must not borrow StatusBadge's vocabulary. */}
                      <span className="shrink-0 rounded-full border border-border-subtle bg-surface-raised px-[var(--space-3)] py-[var(--space-1)] text-meta font-normal font-body text-text-secondary">
                        {formatConfidencePercent(area.value)}
                      </span>
                    </div>
                    {area.unverified.length > 0 && (
                      <div className="flex flex-col gap-[var(--space-1)]">
                        <span className="text-meta font-semibold font-body text-text-secondary">
                          Could not verify
                        </span>
                        <ul className="text-body flex list-disc flex-col gap-[var(--space-1)] pl-5 font-normal font-body text-text-primary">
                          {area.unverified.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <span className="text-body font-normal font-body text-text-primary">
                      Confidence {formatConfidencePercent(area.value)} — {area.basis}
                    </span>
                  </div>
                }
              >
                <p className="text-body font-normal font-body text-text-primary">
                  {area.rationale}
                </p>
              </Disclosure>
            </li>
          ),
        )}
      </ul>
    </RegionCard>
  )
}
