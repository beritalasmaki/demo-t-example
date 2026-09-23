import type { Meta, StoryObj } from '@storybook/react-vite'
import { LoadingState } from './LoadingState'

const meta = {
  title: 'Components/LoadingState',
  component: LoadingState,
  parameters: { layout: 'fullscreen' },
  args: { label: 'Loading run…' },
} satisfies Meta<typeof LoadingState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ShortSpace: Story = { args: { label: 'Loading reviews…', className: 'min-h-[40vh]' } }
