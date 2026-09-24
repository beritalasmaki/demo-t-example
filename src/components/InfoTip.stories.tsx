import type { Meta, StoryObj } from '@storybook/react-vite'
import { InfoTip } from './InfoTip'

const meta = {
  title: 'Components/InfoTip',
  component: InfoTip,
  parameters: { layout: 'padded' },
  args: {
    label: 'Open items',
    children:
      'Things the run could not finish or check. You must look at each one before you approve.',
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingBottom: '120px' }}>
        <span>Open items</span>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InfoTip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** For a column at the right edge: opens leftwards. */
export const AlignEnd: Story = { args: { align: 'end' } }
