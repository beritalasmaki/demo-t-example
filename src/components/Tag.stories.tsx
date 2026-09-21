import type { Meta, StoryObj } from '@storybook/react-vite'
import { CircleCheckBig, Rocket } from 'lucide-react'
import { Tag } from './Tag'

const meta = {
  title: 'Components/Tag',
  component: Tag,
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { icon: Rocket, children: 'Production' },
}

export const DifferentIconsStayDistinct: Story = {
  args: { icon: Rocket, children: 'Production' },
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Tag icon={Rocket}>Production</Tag>
      <Tag icon={CircleCheckBig}>Approved</Tag>
    </div>
  ),
}
