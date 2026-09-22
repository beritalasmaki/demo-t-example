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
 * No colour-by-value: "Low confidence is normal and should look normal, not alarming." Every
 * reported area's percentage band uses the same neutral `--color-surface-raised` tone
 * regardless of how high or low the value is — deliberately not the green/high, yellow/low
 * split some references show, which would turn a normal, expected value into an implied
 * warning. "Not checked" is neutral grey too, matching `StatusBadge`'s `info` tone (see its
 * own doc comment) rather than a colour of its own.
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
      <ul className="flex flex-col gap-[var(--space-5)]">
        {resolveConfidenceAreas(confidence).map((area) =>
          area.missing ? (
            <li
              key={area.area}
              className="flex items-stretch gap-[var(--space-4)] rounded-md border border-border-subtle bg-surface p-[var(--space-4)]"
            >
              {/* Same band width as a reported area's percentage, so missing and reported
               * rows still line up — just neutral icon instead of a value, not a colour. */}
              <div className="flex w-20 shrink-0 items-center justify-center rounded-md bg-surface-raised">
                <CircleHelp aria-hidden className="h-6 w-6 text-text-secondary" />
              </div>
              <span className="flex min-w-0 flex-1 items-center text-item-title font-semibold font-body text-text-primary">
                {formatConfidenceAreaLabel(area.area)}
              </span>
              {/* Third column, vertically centered against the whole row — "Not checked" is
               * static text here (nothing to expand), matching the trigger column's position
               * for a reported area without being a control itself. */}
              <span className="flex shrink-0 items-center gap-[var(--space-2)] text-body font-normal font-body text-text-secondary">
                <CircleHelp aria-hidden className="h-4 w-4 shrink-0" />
                Not checked
              </span>
            </li>
          ) : (
            <li key={area.area}>
              <Disclosure
                className="rounded-md border border-border-subtle bg-surface"
                summaryClassName="gap-[var(--space-4)] p-[var(--space-4)]"
                contentClassName="px-[var(--space-4)] pt-0 pb-[var(--space-4)]"
                summary={
                  <div className="flex min-w-0 flex-1 items-stretch gap-[var(--space-4)]">
                    {/* One consistent neutral band for every reported area, regardless of
                     * value — not coloured by how high or low the percentage is (see this
                     * file's own doc comment). */}
                    <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-md bg-surface-raised">
                      <span className="text-page-title font-bold font-body text-text-primary">
                        {/* sr-only prefix: the big number reads as "Confidence 72%" to
                         * assistive tech even though the band's own position already
                         * supplies that context visually — never a bare number, per
                         * Content rules. */}
                        <span className="sr-only">Confidence </span>
                        {formatConfidencePercent(area.value)}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-[var(--space-2)]">
                      <span className="text-item-title font-semibold font-body text-text-primary">
                        {formatConfidenceAreaLabel(area.area)}
                      </span>
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
                        {area.basis}
                      </span>
                    </div>
                    {/* Third column, vertically centered against the whole row (not
                     * stacked below the middle column) — the trigger label itself;
                     * Disclosure's own chevron renders right after this, also centered. */}
                    <span className="flex shrink-0 items-center text-body font-normal font-body text-text-secondary">
                      Show details
                    </span>
                  </div>
                }
              >
                {/* Hidden until opened — only the longer reasoning; could-not-verify and
                 * basis above stay always visible, unchanged from before this restructure. */}
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
