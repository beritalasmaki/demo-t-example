import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runMessy } from '../../fixtures'
import { StepsTab } from './StepsTab'

const meta = {
  title: 'Features/Run/StepsTab',
  component: StepsTab,
  parameters: { layout: 'padded' },
  args: { run: runMessy },
} satisfies Meta<typeof StepsTab>

export default meta
type Story = StoryObj<typeof meta>

/** 200 steps, 180 of them folded into one row. */
export const LongRun: Story = {}

/** Arrived from a link: the group opens and the row is focused. */
export const FocusedStep: Story = { args: { focusEventId: 'ms150' } }

export const ErrorAndRetry: Story = { args: { run: runBlocked } }

export const Empty: Story = { args: { run: { ...runMessy, timeline: [] } } }
