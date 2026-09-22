import type { Meta, StoryObj } from '@storybook/react-vite'
import { DecisionStatusBanner } from './DecisionStatusBanner'

const meta = {
  title: 'Features/Run/DecisionStatusBanner',
  component: DecisionStatusBanner,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DecisionStatusBanner>

export default meta
type Story = StoryObj<typeof meta>

const base = {
  by: 'Marcus Webb',
  at: '2026-02-11T09:47:00Z',
  acknowledgedGateIds: [],
  revision: 'e91a4c',
}

export const Approved: Story = {
  args: { decision: { ...base, outcome: 'approved' } },
}

export const ChangesRequested: Story = {
  args: {
    decision: { ...base, outcome: 'changes_requested', reason: 'Please add a rollback plan.' },
  },
}

export const Rejected: Story = {
  args: { decision: { ...base, outcome: 'rejected', reason: 'Missing security review.' } },
}
