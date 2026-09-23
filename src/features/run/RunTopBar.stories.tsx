import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Tabs } from '../../components/Tabs'
import { runMessyPending } from '../../fixtures'
import { RunTopBar } from './RunTopBar'

const meta = {
  title: 'Features/Run/RunTopBar',
  component: RunTopBar,
  parameters: { layout: 'fullscreen' },
  args: { run: runMessyPending, reviewsHref: '#' },
  decorators: [
    (Story) => {
      const [value, setValue] = useState('story')
      return (
        <Tabs value={value} onValueChange={setValue}>
          <Story />
        </Tabs>
      )
    },
  ],
} satisfies Meta<typeof RunTopBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** A long name truncates; the revision chip and the tabs stay whole. */
export const LongInitiative: Story = {
  args: {
    run: {
      ...runMessyPending,
      initiative:
        'Move refund processing for cancelled and partially shipped orders to the new payment gateway, in every market',
    },
  },
}
