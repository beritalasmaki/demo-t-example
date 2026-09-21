import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bot, User } from 'lucide-react'
import { ActorIcon } from './ActorIcon'

const meta = {
  title: 'Components/ActorIcon',
  component: ActorIcon,
} satisfies Meta<typeof ActorIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Person: Story = {
  args: { icon: User },
}

export const System: Story = {
  args: { icon: Bot },
}

export const SideBySide: Story = {
  args: { icon: User },
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <ActorIcon icon={User} />
      <ActorIcon icon={Bot} />
    </div>
  ),
}
