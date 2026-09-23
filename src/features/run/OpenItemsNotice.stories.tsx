import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runMessyPending } from '../../fixtures'
import { OpenItemsNotice } from './OpenItemsNotice'

const meta = {
  title: 'Features/Run/OpenItemsNotice',
  component: OpenItemsNotice,
  parameters: { layout: 'padded' },
  args: { run: runMessyPending },
} satisfies Meta<typeof OpenItemsNotice>

export default meta
type Story = StoryObj<typeof meta>

export const ThingsToSolve: Story = {}

export const FailedCheckAndException: Story = { args: { run: runBlocked } }
