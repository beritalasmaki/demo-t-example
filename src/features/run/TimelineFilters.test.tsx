import { render, screen } from '@testing-library/react'
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { TimelineEvent } from '../../lib/types'
import { TimelineFilters } from './TimelineFilters'

/*
 * Radix's DropdownMenu (a modal layer) leaves jsdom — not the real browser, verified
 * separately via Playwright — in a state where a *second*, separately-rendered instance's
 * trigger can no longer be opened by a click, even after the first is fully closed and
 * unmounted. Opening, closing and reopening the *same* mounted instance works reliably, so
 * every interaction that needs the menu open lives in one test below rather than split across
 * several fresh `render()` calls. The label-only tests don't open the menu, so they're
 * unaffected and stay separate.
 */
function setupUser() {
  return userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never })
}

describe('TimelineFilters', () => {
  it('shows the plain "Hide events" label and the trigger reads "None selected" by default', () => {
    render(<TimelineFilters hiddenTypes={new Set()} onHiddenTypesChange={() => {}} />)
    expect(screen.getByText('Hide events')).toBeVisible()
    expect(screen.getByRole('button', { name: 'None selected' })).toBeInTheDocument()
  })

  it('shows the count of hidden types on the trigger', () => {
    render(
      <TimelineFilters
        hiddenTypes={new Set<TimelineEvent['type']>(['plan', 'error'])}
        onHiddenTypesChange={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: '2 selected' })).toBeInTheDocument()
  })

  it('opens to list every type, checked to match hiddenTypes, and toggles types on click', async () => {
    const user = setupUser()
    let hiddenTypes = new Set<TimelineEvent['type']>(['plan'])
    const { rerender } = render(
      <TimelineFilters
        hiddenTypes={hiddenTypes}
        onHiddenTypesChange={(next) => (hiddenTypes = next)}
      />,
    )

    await user.click(screen.getByRole('button', { name: '1 selected' }))

    // One checkbox item per type, in an open menu.
    for (const label of [
      'Plan',
      'Tool calls',
      'File changes',
      'Test runs',
      'Gate evaluations',
      'Errors',
      'Notes',
    ]) {
      expect(screen.getByRole('menuitemcheckbox', { name: label })).toBeInTheDocument()
    }

    // Reflects the initial hiddenTypes via aria-checked.
    expect(screen.getByRole('menuitemcheckbox', { name: 'Plan' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByRole('menuitemcheckbox', { name: 'Errors' })).toHaveAttribute(
      'aria-checked',
      'false',
    )

    // Checking an unselected type adds it to hiddenTypes, and the menu stays open.
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Errors' }))
    expect(hiddenTypes).toEqual(new Set(['plan', 'error']))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    rerender(
      <TimelineFilters
        hiddenTypes={hiddenTypes}
        onHiddenTypesChange={(next) => (hiddenTypes = next)}
      />,
    )
    expect(screen.getByRole('menuitemcheckbox', { name: 'Errors' })).toHaveAttribute(
      'aria-checked',
      'true',
    )

    // Unchecking a selected type removes it from hiddenTypes.
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Plan' }))
    expect(hiddenTypes).toEqual(new Set(['error']))
  })
})
