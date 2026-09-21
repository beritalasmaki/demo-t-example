import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runMessy } from '../../fixtures'
import { ConfidencePanel } from './ConfidencePanel'

const meta = {
  title: 'Features/Run/ConfidencePanel',
  component: ConfidencePanel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ConfidencePanel>

export default meta
type Story = StoryObj<typeof meta>

export const AllAreasReported: Story = {
  args: { confidence: runBlocked.confidence },
}

export const OneAreaNotChecked: Story = {
  // run-messy's own fixture comment: no entry for "security" at all.
  args: { confidence: runMessy.confidence },
}

export const NoneReported: Story = {
  args: { confidence: [] },
}

export const Loading: Story = {
  args: { confidence: [], isLoading: true },
}
