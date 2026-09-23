import type { Meta, StoryObj } from '@storybook/react-vite'
import { runMessy } from '../../fixtures'
import { UndoBox } from './UndoBox'

const decidedAt = new Date(runMessy.decision!.at).getTime()

const meta = {
  title: 'Features/Run/UndoBox',
  component: UndoBox,
  parameters: { layout: 'padded' },
  args: { run: runMessy, onRunUpdated: () => {} },
} satisfies Meta<typeof UndoBox>

export default meta
type Story = StoryObj<typeof meta>

/** Live countdown. */
export const WindowOpen: Story = {}

export const WindowClosed: Story = { args: { now: new Date(decidedAt + 11 * 60_000) } }

export const Rejected: Story = {
  args: {
    run: {
      ...runMessy,
      status: 'rejected',
      decision: { ...runMessy.decision!, outcome: 'rejected' },
    },
  },
}
