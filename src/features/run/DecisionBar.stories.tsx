import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runClean, runMessy } from '../../fixtures'
import { DecisionBar } from './DecisionBar'

/*
 * `run-clean` has no failed or waived gates (no sign-off needed), `run-blocked` has one of
 * each (sign-off needed), and `run-messy` already has a decision with an active undo window —
 * three real fixtures cover four of the five states below without inventing data.
 *
 * Clicking a button for real in these stories opens the dialog and, if carried through, calls
 * the real `submitDecision` — see DecisionDialog.stories.tsx for why that's left as a real
 * round trip rather than mocked here too.
 */
const meta = {
  title: 'Features/Run/DecisionBar',
  component: DecisionBar,
  parameters: { layout: 'padded' },
  args: {
    onRunUpdated: () => {},
  },
} satisfies Meta<typeof DecisionBar>

export default meta
type Story = StoryObj<typeof meta>

export const NoGatesNeedAcknowledgement: Story = {
  args: { run: runClean },
}

export const GatesNeedAcknowledgementUnticked: Story = {
  args: { run: runBlocked },
}

export const GatesNeedAcknowledgementTicked: Story = {
  args: { run: runBlocked, defaultAcknowledged: true },
}

export const Decided: Story = {
  args: { run: runMessy },
}

export const DecidedUndoWindowClosed: Story = {
  args: {
    run: {
      ...runMessy,
      decision: { ...runMessy.decision!, at: '2020-01-01T00:00:00Z' },
    },
  },
}
