import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// React Testing Library does not unmount between tests on its own when
// globals are enabled, so do it here once for every test file.
afterEach(() => {
  cleanup()
})
