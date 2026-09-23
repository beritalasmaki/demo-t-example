import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runMessyPending } from '../../fixtures'
import { EvidenceTab } from './EvidenceTab'

const meta = {
  title: 'Features/Run/EvidenceTab',
  component: EvidenceTab,
  parameters: { layout: 'padded' },
  args: { run: runMessyPending, onOpenStep: () => {} },
} satisfies Meta<typeof EvidenceTab>

export default meta
type Story = StoryObj<typeof meta>

export const ChecksNotRun: Story = {}

export const FailedCheckAndError: Story = { args: { run: runBlocked } }

export const Empty: Story = { args: { run: { ...runMessyPending, timeline: [] } } }
