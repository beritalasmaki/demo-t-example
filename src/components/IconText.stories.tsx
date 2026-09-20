import type { Meta, StoryObj } from '@storybook/react-vite'
import { FilePen, OctagonAlert } from 'lucide-react'
import { IconText } from './IconText'

const meta = {
  title: 'Components/IconText',
  component: IconText,
} satisfies Meta<typeof IconText>

export default meta
type Story = StoryObj<typeof meta>

export const Neutral: Story = {
  args: { icon: FilePen, children: 'File change' },
}

export const WithColouredIcon: Story = {
  args: { icon: OctagonAlert, children: 'Error', iconClassName: 'text-status-fail' },
}
