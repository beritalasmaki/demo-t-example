import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'

/**
 * The keyboard-only pass (docs/DECISIONS.md, 0059): the whole review, from the top of the page
 * to an undone approval, with Tab, Shift+Tab, Space, Enter, the arrow keys and Escape — no
 * mouse. Every stop on the way must show a visible focus outline.
 */

/** What has focus, and whether it shows: the element's own outline, or — for the tick boxes,
 * whose native input is visually hidden — the outline on its label. */
function focused(page: Page) {
  return page.evaluate(() => {
    const element = document.activeElement as HTMLElement
    const shown = element.matches('input[type="checkbox"]') ? element.closest('label') : element
    const style = shown ? getComputedStyle(shown) : null
    return {
      name: (element.getAttribute('aria-label') ?? element.textContent ?? '').trim(),
      role: element.getAttribute('role') ?? element.tagName.toLowerCase(),
      outlined: style != null && style.outlineStyle !== 'none' && style.outlineWidth !== '0px',
    }
  })
}

/** Presses Tab until the focused element's name matches, checking each stop's outline. */
async function tabTo(page: Page, name: RegExp, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab')
    const now = await focused(page)
    if (now.role !== 'body') expect(now.outlined, `no visible focus on "${now.name}"`).toBe(true)
    if (name.test(now.name)) return
  }
  throw new Error(`Tab never reached ${name}`)
}

test('the whole review, keyboard only', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const keys = page.keyboard

  // The top bar's jump lands on the first item left to tick (0059).
  await tabTo(page, /^Jump to the open items/)
  await keys.press('Enter')
  const boxes = page.getByRole('group', { name: /Confirm each open item/ }).getByRole('checkbox')
  await expect(boxes.first()).toBeFocused()

  // Tick all three: Space ticks, Tab passes each item's "Show the …" link.
  await keys.press('Space')
  for (const index of [1, 2]) {
    await tabTo(page, /^$/) // the next tick box (named by its label, not its own text)
    await expect(boxes.nth(index)).toBeFocused()
    await keys.press('Space')
  }
  for (const box of await boxes.all()) await expect(box).toBeChecked()

  await tabTo(page, /^$/)
  await expect(page.getByRole('textbox', { name: /Reason for approving/ })).toBeFocused()
  await keys.type('Licensing and accessibility do not apply to this change.')

  // Approve, then confirm inside the dialog.
  await tabTo(page, /^Approve and release$/)
  await keys.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Approve and release' })
  await expect(dialog).toBeVisible()
  await tabTo(page, /^Approve and release$/)
  await expect(dialog.getByRole('button', { name: 'Approve and release' })).toBeFocused()
  await keys.press('Enter')
  await expect(page.getByRole('heading', { level: 2, name: 'Approved' })).toBeFocused()

  // Undo inside the window.
  await tabTo(page, /^Undo this decision$/)
  await keys.press('Enter')
  await expect(page.getByRole('region', { name: 'Your decision' })).toBeVisible()

  // A dialog closes with Escape and gives focus back to what opened it.
  await tabTo(page, /^Request changes$/)
  await keys.press('Enter')
  await expect(page.getByRole('dialog', { name: 'Request changes' })).toBeVisible()
  await keys.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.getByRole('button', { name: 'Request changes' })).toBeFocused()

  // The views: arrow keys move along the tabs, Enter picks one, focus goes to its heading.
  await tabTo(page, /^Story$/)
  await keys.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'Evidence' })).toBeFocused()
  await keys.press('Enter')
  await expect(page.getByRole('heading', { level: 2, name: 'Evidence' })).toBeFocused()
})
