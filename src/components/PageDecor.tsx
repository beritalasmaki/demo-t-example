import { cn } from '../lib/utils'

/**
 * The page's decorative circles, top right, behind every card (docs/DECISIONS.md, 0068): a
 * soft blue disc, a mint one, and two thin rings. Pure decoration — hidden from assistive
 * technology, never in the way of a click, and drawn only in the `--color-decor-*` tokens, so
 * each theme has its own. The parent needs `isolate`, so the negative z-index stays inside it.
 */
export function PageDecor({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 640 360"
      preserveAspectRatio="xMaxYMin slice"
      className={cn(
        'pointer-events-none absolute top-0 right-0 -z-10 h-[22.5rem] w-[40rem] max-w-full',
        className,
      )}
    >
      <circle cx="470" cy="40" r="170" className="fill-decor-disc" />
      <circle cx="610" cy="170" r="120" className="fill-decor-mint" />
      <circle
        cx="250"
        cy="10"
        r="120"
        fill="none"
        strokeWidth="1.5"
        className="stroke-decor-line"
      />
      <circle
        cx="560"
        cy="330"
        r="200"
        fill="none"
        strokeWidth="1.5"
        className="stroke-decor-line"
      />
    </svg>
  )
}
