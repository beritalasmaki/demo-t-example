import type { Meta, StoryObj } from '@storybook/react-vite'
import { Clock, TriangleAlert } from 'lucide-react'
import { SectionHeading } from './SectionHeading'

const meta = {
  title: 'Features/Run/SectionHeading',
  component: SectionHeading,
  parameters: { layout: 'padded' },
  args: { id: 'heading', icon: Clock, children: 'What happened, in order' },
} satisfies Meta<typeof SectionHeading>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Warning: Story = {
  args: {
    icon: TriangleAlert,
    iconClassName: 'text-status-waived',
    children: 'What is not checked',
  },
}
