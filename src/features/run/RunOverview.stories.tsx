import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runMessy, runMessyPending } from '../../fixtures'
import { RunOverview } from './RunOverview'

const meta = {
  title: 'Features/Run/RunOverview',
  component: RunOverview,
  parameters: { layout: 'padded' },
  args: { run: runMessyPending },
} satisfies Meta<typeof RunOverview>

export default meta
type Story = StoryObj<typeof meta>

export const AwaitingReview: Story = {}

export const Approved: Story = { args: { run: runMessy } }

export const FailedCheckAndException: Story = { args: { run: runBlocked } }

export const StillRunning: Story = {
  args: {
    run: { ...runMessyPending, status: 'running', finishedAt: undefined, assignment: undefined },
  },
}
