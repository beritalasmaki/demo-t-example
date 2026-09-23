import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// React Testing Library does not unmount between tests on its own when
// globals are enabled, so do it here once for every test file.
afterEach(() => {
  cleanup()
})

// jsdom doesn't implement the Pointer Events capture methods or scrollIntoView, which
// radix-ui's popper-based components (DropdownMenu, Tabs' overflow handling) call internally
// when a trigger opens — without these, the open interaction silently no-ops in tests, even
// though it works in a real browser (verified separately via Playwright).
for (const method of ['hasPointerCapture', 'setPointerCapture', 'releasePointerCapture']) {
  if (!(method in Element.prototype)) {
    Object.defineProperty(Element.prototype, method, { value: () => false, writable: true })
  }
}
if (!('scrollIntoView' in Element.prototype)) {
  Object.defineProperty(Element.prototype, 'scrollIntoView', { value: () => {}, writable: true })
}

// jsdom has no canvas. `thinking-orbs` (components/LoadingState) paints on one; returning no
// 2D context lets it skip painting instead of jsdom logging "Not implemented" on every render.
// The real drawing is checked in a browser, not here.
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => null,
  writable: true,
})
