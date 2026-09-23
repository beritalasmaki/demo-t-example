import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runClean, runMessyPending } from '../../fixtures'
import { OpenItemsBox } from './OpenItemsBox'

const meta = {
  title: 'Features/Run/OpenItemsBox',
  component: OpenItemsBox,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '21.25rem' }}>
        <Story />
      </div>
    ),
  ],
  args: { run: runMessyPending },
} satisfies Meta<typeof OpenItemsBox>

export default meta
type Story = StoryObj<typeof meta>

export const ThingsOpen: Story = {}

export const FailedCheckAndException: Story = { args: { run: runBlocked } }

export const NothingOpen: Story = { args: { run: runClean } }
