import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runMessy, runMessyPending } from '../../fixtures'
import { StoryTimeline } from './StoryTimeline'

const meta = {
  title: 'Features/Run/StoryTimeline',
  component: StoryTimeline,
  parameters: { layout: 'padded' },
  args: { run: runMessyPending, onShowSteps: () => {} },
} satisfies Meta<typeof StoryTimeline>

export default meta
type Story = StoryObj<typeof meta>

export const WaitingForDecision: Story = {}

export const Decided: Story = { args: { run: runMessy } }

export const ErrorRetryAndException: Story = { args: { run: runBlocked } }

export const NoStepsYet: Story = { args: { run: { ...runMessyPending, story: [] } } }
