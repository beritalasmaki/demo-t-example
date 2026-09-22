import type { Meta, StoryObj } from '@storybook/react-vite'
import { runClean, runMessy } from '../../fixtures'
import { buildAttentionItems } from '../../lib/attention'
import { AttentionDigest } from './AttentionDigest'

const meta = {
  title: 'Features/Run/AttentionDigest',
  component: AttentionDigest,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AttentionDigest>

export default meta
type Story = StoryObj<typeof meta>

export const ThreeItems: Story = {
  // A not-run gate group, the weakest confidence area, and a flagged audit note.
  args: { items: buildAttentionItems(runMessy) },
}

export const OneItem: Story = {
  // Everything passed; the only thing worth surfacing is what the model could not verify.
  args: { items: buildAttentionItems(runClean) },
}

export const Empty: Story = {
  // Renders nothing — verifies the component returns null rather than an empty card.
  args: { items: [] },
}
