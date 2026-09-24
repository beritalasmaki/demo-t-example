import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'

/**
 * The time-boxed accessibility check (docs/DECISIONS.md, 0059): axe's WCAG 2.2 A and AA rules,
 * colour contrast included, over the composed page in every state a reviewer reaches, in
 * light and dark. Not the full audit AGENTS.md first planned — see 0059 for what this does
 * not cover.
 */
const STATES: { name: string; url: string; open?: (page: Page) => Promise<void> }[] = [
  { name: 'pending run, Story', url: '/' },
  {
    name: 'pending run, Evidence',
    url: '/',
    open: (page) => page.getByRole('tab', { name: 'Evidence' }).click(),
  },
  {
    name: 'pending run, All steps',
    url: '/',
    open: (page) => page.getByRole('tab', { name: /^All \d+ steps$/ }).click(),
  },
  { name: 'clean run', url: '/?run=run-clean' },
  { name: 'blocked run', url: '/?run=run-blocked' },
  { name: 'decided run, undo window open', url: '/?run=run-messy' },
  { name: 'My reviews', url: '/?view=reviews' },
  {
    name: 'decision dialog',
    url: '/?run=run-clean',
    open: async (page) => {
      await page.getByRole('button', { name: 'Request changes' }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
    },
  },
]

/** The page background's lightness, 0–255: proves the theme really switched. */
function backgroundLightness(page: Page) {
  return page.evaluate(() => {
    const [r, g, b] = getComputedStyle(document.body).backgroundColor.match(/\d+/g)!.map(Number)
    return (r + g + b) / 3
  })
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} theme`, () => {
    for (const state of STATES) {
      test(`${state.name}: no WCAG A/AA violations, contrast included`, async ({ page }) => {
        // Reduced motion, so nothing is mid-transition when axe reads colours.
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' })
        await page.goto(state.url)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        await state.open?.(page)

        const lightness = await backgroundLightness(page)
        expect(scheme === 'light' ? lightness > 200 : lightness < 60).toBe(true)

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze()
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([])
        // Contrast axe could not decide (text over an image or a gradient) would slip past
        // `violations`; there is none today, and a new one should be looked at by eye.
        expect(results.incomplete.filter((r) => r.id === 'color-contrast')).toEqual([])
      })
    }
  })
}
