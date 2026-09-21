import { cn } from '../lib/utils'

/**
 * A link labelled with what it leads to and how much of it there is — "Evidence (2)", or
 * "Sources (1)" in a different product. AGENTS.md non-negotiable 3: "No claim without a
 * source... must link to the evidence it came from." This is that link, generic enough to
 * work anywhere a claim needs to point at what backs it up; it knows nothing about runs,
 * gates or timelines — the caller decides what `href` resolves to and what `label` means.
 */
export interface EvidenceLinkProps {
  href: string
  label: string
  count: number
  className?: string
}

export function EvidenceLink({ href, label, count, className }: EvidenceLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'text-sm text-primary underline decoration-1 underline-offset-2 hover:text-primary-hover',
        className,
      )}
    >
      {label} ({count})
    </a>
  )
}
