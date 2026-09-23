import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runClean, runMessy, runMessyPending } from '../../fixtures'
import { UnverifiedList } from './UnverifiedList'

const meta = {
  title: 'Features/Run/UnverifiedList',
  component: UnverifiedList,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '21.25rem' }}>
        <Story />
      </div>
    ),
  ],
  args: { run: runMessyPending },
} satisfies Meta<typeof UnverifiedList>

export default meta
type Story = StoryObj<typeof meta>

export const BeforeDecision: Story = {}

export const AfterDecision: Story = { args: { run: runMessy } }

export const FailedCheckAndException: Story = { args: { run: runBlocked } }

export const NothingUnverified: Story = {
  args: {
    run: { ...runClean, confidence: runClean.confidence.filter((area) => area.value >= 0.85) },
  },
}
