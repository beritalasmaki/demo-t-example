import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runClean, runMessyPending } from '../../fixtures'
import { DecisionPanel } from './DecisionPanel'

const meta = {
  title: 'Features/Run/DecisionPanel',
  component: DecisionPanel,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '21.25rem' }}>
        <Story />
      </div>
    ),
  ],
  args: { run: runMessyPending, onRunUpdated: () => {}, submitDecisionOptions: { delayMs: 300 } },
} satisfies Meta<typeof DecisionPanel>

export default meta
type Story = StoryObj<typeof meta>

/** Nothing ticked, no reason: Approve is blocked and says what is left to do. */
export const NothingTicked: Story = {}

export const OneTicked: Story = { args: { defaultTickedIds: ['open-gates-unknown'] } }

/** Every item ticked and a reason written: Approve is the one filled button. */
export const ReadyToApprove: Story = {
  args: {
    defaultTickedIds: ['open-gates-unknown', 'open-confidence-side_effects', 'open-note-m19'],
    defaultReason: 'Neither check applies: no new dependencies, and no new screens.',
  },
}

export const FailedCheckAndException: Story = { args: { run: runBlocked } }

/** Nothing open: no ticks, and the reason is optional. */
export const NothingOpen: Story = { args: { run: runClean } }
