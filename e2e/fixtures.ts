import { test as base } from '@playwright/test'

/**
 * Every spec starts past the welcome intro: it plays once per visit (docs/DECISIONS.md,
 * 0049) and would sit over the page for its first four seconds. Same flag the app sets.
 */
export const test = base.extend({
  // The second argument is Playwright's `use`, renamed: the React hooks lint rule reads any
  // call to `use` as a React hook.
  page: async ({ page }, provide) => {
    await page.addInitScript(() => sessionStorage.setItem('ledger:intro-seen', '1'))
    await provide(page)
  },
})

export { expect } from '@playwright/test'
