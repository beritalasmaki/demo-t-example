import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { TimelineEvent } from '../../lib/types'
import { TimelineFilters } from './TimelineFilters'

describe('TimelineFilters', () => {
  it('renders one chip per event type', () => {
    render(<TimelineFilters activeTypes={new Set()} onActiveTypesChange={() => {}} />)
    for (const label of [
      'Plan',
      'Tool calls',
      'File changes',
      'Test runs',
      'Gate evaluations',
      'Errors',
      'Notes',
    ]) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('reflects which types are active via aria-pressed', () => {
    render(
      <TimelineFilters
        activeTypes={new Set<TimelineEvent['type']>(['plan'])}
        onActiveTypesChange={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: 'Plan' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Errors' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('adds the type when its chip is pressed while inactive', async () => {
    const user = userEvent.setup()
    const onActiveTypesChange = vi.fn()
    render(<TimelineFilters activeTypes={new Set()} onActiveTypesChange={onActiveTypesChange} />)

    await user.click(screen.getByRole('button', { name: 'Plan' }))
    expect(onActiveTypesChange).toHaveBeenCalledWith(new Set(['plan']))
  })

  it('removes the type when its chip is pressed while active', async () => {
    const user = userEvent.setup()
    const onActiveTypesChange = vi.fn()
    render(
      <TimelineFilters
        activeTypes={new Set<TimelineEvent['type']>(['plan', 'error'])}
        onActiveTypesChange={onActiveTypesChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Plan' }))
    expect(onActiveTypesChange).toHaveBeenCalledWith(new Set(['error']))
  })

  it('keeps focus on the chip that was just toggled', async () => {
    const user = userEvent.setup()
    function Wrapper() {
      const [activeTypes, setActiveTypes] = useState<Set<TimelineEvent['type']>>(new Set())
      return <TimelineFilters activeTypes={activeTypes} onActiveTypesChange={setActiveTypes} />
    }
    render(<Wrapper />)

    const chip = screen.getByRole('button', { name: 'Plan' })
    await user.click(chip)
    expect(chip).toHaveFocus()
  })
})
