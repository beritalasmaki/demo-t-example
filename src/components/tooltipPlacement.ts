/**
 * Keeps a `.t-tt` tooltip inside the window. Positioned from its trigger, a tooltip can run
 * past the window's edge; this measures it just before it shows and nudges it back with
 * `--tt-shift`, which the transition's own transform already includes.
 */
export function keepTooltipInView(tip: HTMLElement | null, margin = 8) {
  if (!tip) return
  tip.style.setProperty('--tt-shift', '0px')
  const box = tip.getBoundingClientRect()
  const shift =
    box.right > window.innerWidth - margin
      ? window.innerWidth - margin - box.right
      : box.left < margin
        ? margin - box.left
        : 0
  tip.style.setProperty('--tt-shift', `${Math.round(shift)}px`)
}
