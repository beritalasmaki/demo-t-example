import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runClean, runMessy, runMessyPending } from '../../fixtures'
import { RunOverview } from './RunOverview'

const meta = {
  title: 'Features/Run/RunOverview',
  component: RunOverview,
  parameters: { layout: 'fullscreen' },
  args: {
    run: runMessyPending,
    onRunUpdated: () => {},
    expanded: true,
    onExpandedChange: () => {},
  },
} satisfies Meta<typeof RunOverview>

export default meta
type Story = StoryObj<typeof meta>

export const AwaitingReview: Story = {}

export const Approved: Story = { args: { run: runMessy } }

export const FailedCheckAndException: Story = { args: { run: runBlocked } }

export const NothingOpen: Story = { args: { run: runClean } }

export const StillRunning: Story = {
  args: {
    run: { ...runMessyPending, status: 'running', finishedAt: undefined, assignment: undefined },
  },
}

export const LongInitiative: Story = {
  args: {
    run: {
      ...runMessyPending,
      initiative:
        'Move refund processing for cancelled and partially shipped orders to the new payment gateway, in every market',
    },
  },
}

/** After the reviewer has switched views: one compact row, with "Show details" on the border. */
export const Collapsed: Story = { args: { expanded: false } }

/** Decided and still undoable: the details stay open even when collapsed was asked for. */
export const ApprovedUndoOpen: Story = { args: { run: runMessy, expanded: false } }

/** Decided, undo window closed: the details can collapse again. */
export const ApprovedUndoClosed: Story = {
  args: {
    run: {
      ...runMessy,
      decision: { ...runMessy.decision!, at: new Date(Date.now() - 20 * 60_000).toISOString() },
    },
    expanded: false,
  },
}
