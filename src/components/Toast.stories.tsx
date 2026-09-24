import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toast } from './Toast'

const meta = {
  title: 'Components/Toast',
  component: Toast,
  parameters: { layout: 'fullscreen' },
  args: {
    message: 'Request sent to Maarit Kasakallio. You will get a message when they answer.',
    onClose: () => {},
  },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
