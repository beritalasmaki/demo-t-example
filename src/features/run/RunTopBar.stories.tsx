import type { Meta, StoryObj } from '@storybook/react-vite'
import { runMessyPending } from '../../fixtures'
import { RunTopBar } from './RunTopBar'

const meta = {
  title: 'Features/Run/RunTopBar',
  component: RunTopBar,
  parameters: { layout: 'fullscreen' },
  args: { run: runMessyPending, reviewsHref: '#' },
} satisfies Meta<typeof RunTopBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** A long name truncates; the revision chip stays whole. */
export const LongInitiative: Story = {
  args: {
    run: {
      ...runMessyPending,
      initiative:
        'Move refund processing for cancelled and partially shipped orders to the new payment gateway, in every market',
    },
  },
}
