import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs'

function PillTabs() {
  const [value, setValue] = useState('a')
  return (
    <Tabs value={value} onValueChange={setValue}>
      <TabsList variant="pill" label="Views">
        <TabsTrigger variant="pill" value="a" tooltip="The first view">
          First
        </TabsTrigger>
        <TabsTrigger variant="pill" value="b">
          Second
        </TabsTrigger>
      </TabsList>
      <TabsContent value="a">A</TabsContent>
      <TabsContent value="b">B</TabsContent>
    </Tabs>
  )
}

describe('Tabs, pill variant', () => {
  it('draws one sliding pill behind the tabs, hidden from assistive tech', () => {
    const { container } = render(<PillTabs />)
    const pill = container.querySelector('.t-tabs-pill')
    expect(pill).not.toBeNull()
    expect(pill).toHaveAttribute('aria-hidden')
    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })

  it('links a tooltip to its tab, and Escape dismisses it', async () => {
    const user = userEvent.setup()
    render(<PillTabs />)
    const tab = screen.getByRole('tab', { name: 'First' })
    const tooltip = screen.getByRole('tooltip', { hidden: true })
    expect(tooltip).toHaveTextContent('The first view')
    expect(tab).toHaveAttribute('aria-describedby', tooltip.id)
    // Hidden from the tab list's children, still the tab's description.
    expect(tooltip).toHaveAttribute('aria-hidden', 'true')
    expect(tab).toHaveAccessibleDescription('The first view')
    expect(screen.getByRole('tab', { name: 'Second' })).not.toHaveAttribute('aria-describedby')

    tab.focus()
    await user.keyboard('{Escape}')
    expect(tooltip.parentElement).toHaveAttribute('data-dismissed')
  })

  it('line variant: a real tab list whose selected tab is marked', async () => {
    function Line() {
      const [value, setValue] = useState('a')
      return (
        <Tabs value={value} onValueChange={setValue}>
          <TabsList variant="line" label="Run types">
            <TabsTrigger variant="line" value="a">
              Pending
            </TabsTrigger>
            <TabsTrigger variant="line" value="b">
              Approved
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )
    }
    render(<Line />)
    expect(screen.getByRole('tablist', { name: 'Run types' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: 'Approved' }))
    expect(screen.getByRole('tab', { name: 'Approved' })).toHaveAttribute('aria-selected', 'true')
  })
})
