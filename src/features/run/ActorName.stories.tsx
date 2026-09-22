import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActorName } from './ActorName'

const meta = {
  title: 'Features/Run/ActorName',
  component: ActorName,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ActorName>

export default meta
type Story = StoryObj<typeof meta>

export const Human: Story = {
  args: { name: 'Marcus Webb' },
}

export const System: Story = {
  args: { name: 'policy-engine v2.3' },
}
