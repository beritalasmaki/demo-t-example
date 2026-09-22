import { Eye } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionLink } from './ActionLink'

const meta = {
  title: 'Components/ActionLink',
  component: ActionLink,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ActionLink>

export default meta
type Story = StoryObj<typeof meta>

export const TrailingArrow: Story = {
  args: { href: '#policy-gates-heading', children: 'See policy gates' },
}

export const WithCount: Story = {
  args: { href: '#timeline-event-t1', children: 'Evidence (2)' },
}

export const LeadingIcon: Story = {
  args: {
    href: '#decision-heading',
    children: 'View the decision details',
    icon: Eye,
    iconPosition: 'start',
  },
}
