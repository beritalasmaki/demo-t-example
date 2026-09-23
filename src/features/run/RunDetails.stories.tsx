import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runClean, runMessy, runMessyPending } from '../../fixtures'
import { RunDetails } from './RunDetails'

const meta = {
  title: 'Features/Run/RunDetails',
  component: RunDetails,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '17.5rem' }}>
        <Story />
      </div>
    ),
  ],
  args: { run: runMessyPending },
} satisfies Meta<typeof RunDetails>

export default meta
type Story = StoryObj<typeof meta>

export const AwaitingReview: Story = {}

export const Released: Story = { args: { run: runMessy } }

export const FailedCheckAndException: Story = { args: { run: runBlocked } }

export const Staging: Story = { args: { run: runClean } }

export const StillRunning: Story = {
  args: { run: { ...runMessyPending, status: 'running', finishedAt: undefined, confidence: [] } },
}
