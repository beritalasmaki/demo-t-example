import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runClean, runMessy, runMessyPending } from '../../fixtures'
import { RunOverview } from './RunOverview'

const meta = {
  title: 'Features/Run/RunOverview',
  component: RunOverview,
  parameters: { layout: 'fullscreen' },
  args: {
    run: runMessyPending,
    onRunUpdated: () => {},
    expanded: true,
    onExpandedChange: () => {},
  },
} satisfies Meta<typeof RunOverview>

export default meta
type Story = StoryObj<typeof meta>

export const AwaitingReview: Story = {}

export const Approved: Story = { args: { run: runMessy } }

export const FailedCheckAndException: Story = { args: { run: runBlocked } }

export const NothingOpen: Story = { args: { run: runClean } }

export const StillRunning: Story = {
  args: {
    run: { ...runMessyPending, status: 'running', finishedAt: undefined, assignment: undefined },
  },
}

export const LongInitiative: Story = {
  args: {
    run: {
      ...runMessyPending,
      initiative:
        'Move refund processing for cancelled and partially shipped orders to the new payment gateway, in every market',
    },
  },
}

/** After the reviewer has switched views: one compact row, with "Show details" on the border. */
export const Collapsed: Story = { args: { expanded: false } }

export const CollapsedApproved: Story = { args: { run: runMessy, expanded: false } }
