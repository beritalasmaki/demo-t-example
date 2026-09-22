import { TriangleAlert } from 'lucide-react'
import { IconText } from '../../components/IconText'
import { RegionCard } from '../../components/RegionCard'
import type { AttentionItem } from '../../lib/attention'

/**
 * The "Before you rely on this" digest — not one of docs/spec-review-screen.md's six regions,
 * but a synthesized shortcut to the handful of things `lib/attention.ts`'s `buildAttentionItems`
 * found worth a reviewer's attention before they decide. Every item links to the region it
 * came from, so nothing here is a claim without its source right next to it.
 *
 * This card's own chrome (heading icon, border) stays fully neutral, deliberately not a
 * `--color-status-*` colour: it summarizes several different kinds of things at once (a gate
 * result, a confidence value, an audit note), so it is never itself "reporting a
 * pass/fail/waived/not_applicable/unknown result" the way one `StatusBadge` is —
 * src/styles/README.md's usage rule reserves status colour for exactly that. `RunHeader.tsx`
 * makes the identical call for `RunStatus`, for the identical reason — see its own doc
 * comment. See docs/DECISIONS.md for this trade-off.
 */
export interface AttentionDigestProps {
  items: AttentionItem[]
}

export function AttentionDigest({ items }: AttentionDigestProps) {
  if (items.length === 0) return null

  return (
    <RegionCard className="flex flex-col gap-[var(--space-3)]">
      <h2
        id="needs-attention-heading"
        className="text-section-heading font-semibold text-text-primary"
      >
        <IconText icon={TriangleAlert}>Before you rely on this</IconText>
      </h2>
      <ul className="flex flex-col divide-y divide-border-subtle">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-[var(--space-1)] py-[var(--space-3)] first:pt-0 last:pb-0"
          >
            <p className="text-body font-normal font-body text-text-primary">
              <span className="font-semibold">{item.lead}</span>
              {item.body && ` ${item.body}`}
            </p>
            <a
              href={item.linkHref}
              className="text-body w-fit font-normal font-body text-primary underline decoration-1 underline-offset-2 hover:text-primary-hover"
            >
              {item.linkLabel}
            </a>
          </li>
        ))}
      </ul>
    </RegionCard>
  )
}
