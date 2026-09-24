import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MyReviews } from './MyReviews'

const runHref = (id: string) => `?run=${id}`

async function renderLoaded() {
  const user = userEvent.setup()
  render(<MyReviews runHref={runHref} options={{ delayMs: 0 }} />)
  await screen.findByRole('tablist', { name: 'Run types' })
  return user
}

const rows = () =>
  within(screen.getByRole('table', { name: /runs$/ }))
    .getAllByRole('row')
    .slice(1)

describe('MyReviews', () => {
  afterEach(() => vi.restoreAllMocks())

  it('opens on pending runs, with a count on every tab and a link to each review', async () => {
    await renderLoaded()
    expect(screen.getByRole('tab', { name: /Pending/, selected: true })).toHaveTextContent('3')
    expect(screen.getByRole('tab', { name: /Approved/ })).toHaveTextContent('1')
    expect(screen.getByRole('tab', { name: /All runs/ })).toHaveTextContent('4')
    expect(rows()).toHaveLength(3)
    expect(screen.getByText('3 need your review')).toBeVisible()
    expect(
      screen.getByRole('link', {
        name: 'Review “Add a CSV export to the appointment history page”',
      }),
    ).toHaveAttribute('href', '?run=run-clean')
  })

  it('searches, says how many it shows, and offers to clear when nothing matches', async () => {
    const user = await renderLoaded()
    await user.type(screen.getByRole('searchbox', { name: 'Search runs' }), 'booking')
    expect(rows()).toHaveLength(1)
    expect(screen.getByText('Showing 1 of 4 active runs')).toBeVisible()

    await user.type(screen.getByRole('searchbox', { name: 'Search runs' }), 'zzz')
    expect(screen.getByText('No active runs match these filters')).toBeVisible()
    await user.click(screen.getAllByRole('button', { name: /Clear filters/ })[0])
    expect(rows()).toHaveLength(3)
  })

  it('orders by a column and says so on its header', async () => {
    const user = await renderLoaded()
    const sortByRun = screen.getByRole('button', { name: 'Order by run: A to Z' })
    await user.click(sortByRun)
    expect(sortByRun.closest('th')).toHaveAttribute('aria-sort', 'ascending')
  })

  it('archives a finished run, and restores it from the archive', async () => {
    const user = await renderLoaded()
    await user.click(screen.getByRole('tab', { name: /Approved/ }))
    await user.click(screen.getByRole('button', { name: /^Archive “Move refund processing/ }))
    expect(screen.getByRole('status')).toHaveTextContent(
      /Archived “Move refund processing.*restore it for 7 days/,
    )
    expect(screen.getByRole('tab', { name: /Approved/ })).toHaveTextContent('0')

    await user.click(screen.getByRole('button', { name: 'Archive, 1 archived run' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Archive' })).toHaveFocus()
    expect(screen.getByText('By you')).toBeVisible()
    await user.click(screen.getByRole('button', { name: /^Restore “Move refund processing/ }))
    expect(screen.getByText('No archived runs match these filters.')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'My reviews' }))
    expect(screen.getByRole('tab', { name: /Approved/ })).toHaveTextContent('1')
  })

  it("shows a run's decision details from its own data", async () => {
    const user = await renderLoaded()
    await user.click(screen.getByRole('tab', { name: /Approved/ }))
    await user.click(
      screen.getByRole('button', { name: /^Decision details: Move refund processing/ }),
    )
    const dialog = screen.getByRole('dialog', {
      name: 'Move refund processing to the new payment gateway',
    })
    expect(within(dialog).getByText('Approved')).toBeVisible()
    expect(within(dialog).getByText(/Released to payments-service \(production\)/)).toBeVisible()
    expect(within(dialog).getByRole('link', { name: /Open the full review/ })).toHaveAttribute(
      'href',
      '?run=run-messy',
    )
  })

  it('requests a new run only once the mistake is described', async () => {
    const user = await renderLoaded()
    await user.click(screen.getByRole('tab', { name: /Approved/ }))
    await user.click(screen.getByRole('button', { name: /^Request a new run: Move refund/ }))
    const send = screen.getByRole('button', { name: 'Send request' })
    expect(send).toBeDisabled()
    await user.type(screen.getByRole('textbox', { name: /What went wrong/ }), 'Rounding is wrong.')
    await user.click(send)
    expect(screen.getByRole('status')).toHaveTextContent('Request sent to Maarit Kasakallio.')
  })

  it('makes a CSV report of the selected runs', async () => {
    const createObjectURL = vi.fn(() => 'blob:report')
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = vi.fn()
    const user = await renderLoaded()
    await user.click(screen.getByRole('tab', { name: /Approved/ }))
    await user.click(screen.getByRole('checkbox', { name: /Select “Move refund/ }))
    expect(screen.getByText('1 run selected')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Create report' }))
    await user.click(screen.getByRole('radio', { name: 'CSV, for spreadsheets' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Create report' }),
    )
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(screen.getByRole('status')).toHaveTextContent(/created as CSV, 1 run\./)
  })

  it('does not let a pending run be selected', async () => {
    await renderLoaded()
    for (const box of screen.getAllByRole('checkbox', { name: /^Select/ })) {
      expect(box).toBeDisabled()
    }
  })

  it('shows a loading state, and a failed load with Retry', async () => {
    const { unmount } = render(<MyReviews runHref={runHref} options={{ delayMs: 50 }} />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading reviews')
    unmount()

    render(<MyReviews runHref={runHref} options={{ delayMs: 0, simulateNetworkError: true }} />)
    expect(await screen.findByText(/Could not load your reviews/)).toBeVisible()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible()
  })
})
