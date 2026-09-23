/**
 * Plays the spotlight on `element` (`.t-spotlight` in styles/transitions.css;
 * docs/DECISIONS.md, 0056), from the start even if it is already playing. The attribute is
 * removed when the animation ends, or after `fallbackMs` if it never runs.
 */
export function spotlight(element: HTMLElement, fallbackMs = 1600) {
  element.removeAttribute('data-spotlight')
  // Read layout so the browser sees the attribute go before it comes back: a restart.
  void element.offsetWidth
  element.setAttribute('data-spotlight', '')
  const clear = () => {
    window.clearTimeout(timer)
    element.removeAttribute('data-spotlight')
  }
  const timer = window.setTimeout(clear, fallbackMs)
  element.addEventListener(
    'animationend',
    (event) => {
      if (event.target === element) clear()
    },
    { once: true },
  )
}
