import type { Meta, StoryObj } from '@storybook/react-vite'
import { runMessy } from '../../fixtures'
import { DecisionDialog } from './DecisionDialog'

/*
 * Every state from docs/spec-review-screen.md, Region 6 and Content rules, except the plain
 * success path — that's a real round trip through lib/api's `submitDecision`, already covered
 * end to end by DecisionDialog.test.tsx and DecisionBar.test.tsx (and verified once more
 * against the real dev server — see docs/WORKLOG.md). A story that actually completed
 * "Approve and release" here would mutate the shared in-memory fixture store for the rest of
 * this Storybook session, which isn't worth it just to look at a state that renders
 * identically to `ApproveConfirmation` below until the moment it's clicked.
 */
const meta = {
  title: 'Features/Run/DecisionDialog',
  component: DecisionDialog,
  parameters: { layout: 'centered' },
  args: {
    runId: 'story-run',
    revision: 'f3a9c2',
    environment: 'production',
    reviewerName: 'Jordan Ellis',
    acknowledgedGateIds: [],
    onClose: () => {},
    onDecided: () => {},
    onConflict: () => {},
  },
} satisfies Meta<typeof DecisionDialog>

export default meta
type Story = StoryObj<typeof meta>

export const ApproveConfirmation: Story = {
  args: { action: 'approved' },
}

export const RequestChangesEmpty: Story = {
  args: { action: 'changes_requested' },
}

export const RequestChangesFilled: Story = {
  args: {
    action: 'changes_requested',
    initialReason: 'Please add a test for the empty appointment list case.',
  },
}

export const RejectEmpty: Story = {
  args: { action: 'rejected' },
}

export const RejectFilled: Story = {
  args: {
    action: 'rejected',
    initialReason: 'The confidence on side effects is too low for a production release.',
  },
}

export const NetworkFailureOnSubmit: Story = {
  args: {
    action: 'approved',
    initialState: { status: 'error', message: 'The connection timed out.' },
  },
}

export const AlreadyDecidedConflict: Story = {
  args: {
    action: 'rejected',
    initialReason: 'The confidence on side effects is too low for a production release.',
    initialState: {
      status: 'conflict',
      currentDecision: runMessy.decision!,
    },
  },
}
